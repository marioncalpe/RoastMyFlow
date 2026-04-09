import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * SpotifyAuthService
 * Gère l'authentification OAuth 2.0 avec Spotify via le flow PKCE
 * PKCE = Proof Key for Code Exchange (pas besoin de backend, 100% sécurisé côté client)
 */
@Injectable({
  providedIn: 'root' // Service disponible dans toute l'app sans l'importer dans un module
})
export class SpotifyAuthService {

  // Clés récupérées depuis environment.ts pour ne pas hardcoder les valeurs
  private clientId = environment.spotify.clientId;
  private redirectUri = environment.spotify.redirectUri;
  private scopes = environment.spotify.scopes;

  // Le code verifier est généré aléatoirement à chaque login, stocké temporairement
  private codeVerifier = '';

  constructor(private router: Router) {}

  /**
   * login()
   * Étape 1 du flow PKCE :
   * - Génère un code verifier aléatoire
   * - Génère un code challenge (hash SHA-256 du verifier)
   * - Stocke le verifier en sessionStorage pour l'étape 2
   * - Redirige l'utilisateur vers la page de login Spotify
   */
  async login(): Promise<void> {
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    // On sauvegarde le verifier pour pouvoir l'utiliser dans handleCallback()
    sessionStorage.setItem('spotify_code_verifier', this.codeVerifier);

    // Construction des paramètres de la requête OAuth
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',       // On veut un code d'autorisation, pas un token direct
      redirect_uri: this.redirectUri,
      scope: this.scopes,           // Permissions demandées à l'utilisateur
      code_challenge_method: 'S256', // Algorithme de hashage utilisé
      code_challenge: codeChallenge
    });

    // Redirection vers Spotify — l'utilisateur va se connecter sur leur page
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * handleCallback()
   * Étape 2 du flow PKCE :
   * - Spotify nous renvoie un code dans l'URL après le login
   * - On échange ce code contre un vrai access token
   * - On stocke le token en sessionStorage
   */
  async handleCallback(code: string): Promise<void> {
    // On récupère le verifier stocké à l'étape 1
    const verifier = sessionStorage.getItem('spotify_code_verifier');

    // Si le verifier n'existe pas, quelque chose s'est mal passé
    if (!verifier) {
      this.router.navigate(['/error']);
      return;
    }

    // Échange du code contre un access token via l'API Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code', // Type d'échange OAuth
        code,                              // Le code reçu de Spotify dans l'URL
        redirect_uri: this.redirectUri,
        code_verifier: verifier            // Preuve que c'est bien nous qui avons initié le flow
      })
    });

    const data = await response.json();

    if (data.access_token) {
      // Succès : on stocke le token et on redirige vers le loading
      sessionStorage.setItem('spotify_token', data.access_token);
      sessionStorage.setItem('spotify_provider', 'spotify'); // Pour savoir quelle plateforme est active
      sessionStorage.removeItem('spotify_code_verifier');    // On nettoie, plus besoin du verifier
      this.router.navigate(['/loading']);
    } else {
      // Échec : on redirige vers la page d'erreur
      this.router.navigate(['/error']);
    }
  }

  /**
   * getToken()
   * Retourne le token Spotify stocké en sessionStorage
   * Retourne null si l'utilisateur n'est pas connecté
   */
  getToken(): string | null {
    return sessionStorage.getItem('spotify_token');
  }

  /**
   * isLoggedIn()
   * Vérifie si l'utilisateur est connecté à Spotify
   * Utilisé par les guards et les components pour protéger les routes
   */
  isLoggedIn(): boolean {
    return !!this.getToken(); // !! convertit null en false et une string en true
  }

  /**
   * logout()
   * Déconnecte l'utilisateur en nettoyant le sessionStorage
   * et redirige vers la page de login
   */
  logout(): void {
    sessionStorage.removeItem('spotify_token');
    sessionStorage.removeItem('spotify_provider');
    this.router.navigate(['/login']);
  }

  /**
   * generateCodeVerifier()
   * Génère une chaîne aléatoire de 32 bytes encodée en base64
   * C'est le "secret" côté client du flow PKCE
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32); // 32 bytes aléatoires
    crypto.getRandomValues(array);    // Rempli avec des valeurs vraiment aléatoires
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')  // On remplace les caractères non URL-safe
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * generateCodeChallenge()
   * Hash le code verifier avec SHA-256 et l'encode en base64
   * C'est ce qu'on envoie à Spotify — ils vérifient que le verifier correspond au challenge
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);                        // Encode en UTF-8
    const digest = await crypto.subtle.digest('SHA-256', data);   // Hash SHA-256
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}