import { Injectable } from '@angular/core';
import { SpotifyAuthService } from './spotify-auth.service';
import { LastfmService } from './lastfm.service';

/**
 * AuthService
 * Service central qui orchestre l'authentification Spotify et Last.fm
 * C'est CE service que les components appelleront — jamais directement
 * SpotifyAuthService ou LastfmService
 *
 * Principe : les components ne savent pas quelle plateforme est utilisée,
 * ils appellent juste AuthService et lui se débrouille.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private spotifyAuth: SpotifyAuthService, // Service Spotify injecté
    private lastfmAuth: LastfmService         // Service Last.fm injecté
  ) {}

  /**
   * loginWithSpotify()
   * Déclenche le flow OAuth Spotify (PKCE)
   * Appelé quand l'utilisateur clique sur "Se connecter avec Spotify"
   */
  async loginWithSpotify(): Promise<void> {
    await this.spotifyAuth.login();
  }

  /**
   * loginWithLastfm()
   * Déclenche le flow OAuth Last.fm
   * Appelé quand l'utilisateur clique sur "Se connecter avec Last.fm"
   */
  loginWithLastfm(): void {
    this.lastfmAuth.login();
  }

  /**
   * handleCallback()
   * Gère le retour après authentification
   * Détecte automatiquement quelle plateforme a renvoyé le callback
   * en regardant les paramètres dans l'URL
   *
   * Spotify renvoie : ?code=xxx
   * Last.fm renvoie : ?token=xxx
   */
  async handleCallback(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');     // Paramètre Spotify
    const token = params.get('token');   // Paramètre Last.fm

    if (code) {
      // C'est un callback Spotify
      await this.spotifyAuth.handleCallback(code);
    } else if (token) {
      // C'est un callback Last.fm
      this.lastfmAuth.handleCallback(token);
    }
  }

  /**
   * isLoggedIn()
   * Vérifie si l'utilisateur est connecté sur l'une ou l'autre plateforme
   */
  isLoggedIn(): boolean {
    return this.spotifyAuth.isLoggedIn() || this.lastfmAuth.isLoggedIn();
  }

  /**
   * getActiveProvider()
   * Retourne la plateforme active : 'spotify' | 'lastfm' | null
   * Utile pour afficher le bon logo et adapter les appels API
   */
  getActiveProvider(): string | null {
    return sessionStorage.getItem('spotify_provider');
  }

  /**
   * getToken()
   * Retourne le token de la plateforme active
   */
  getToken(): string | null {
    const provider = this.getActiveProvider();
    if (provider === 'spotify') return this.spotifyAuth.getToken();
    if (provider === 'lastfm') return this.lastfmAuth.getToken();
    return null;
  }

  /**
   * logout()
   * Déconnecte l'utilisateur de la plateforme active
   */
  logout(): void {
    const provider = this.getActiveProvider();
    if (provider === 'spotify') this.spotifyAuth.logout();
    if (provider === 'lastfm') this.lastfmAuth.logout();
  }
}