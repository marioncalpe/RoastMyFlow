import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * LastfmService
 * Gère l'authentification et les appels API Last.fm
 * Last.fm utilise un flow OAuth plus simple que Spotify :
 * - Pas de PKCE
 * - Une clé API publique suffit pour les données publiques
 * - Pour les données privées on utilise un token de session
 */
@Injectable({
  providedIn: 'root'
})
export class LastfmService {

  // URL de base de l'API Last.fm récupérée depuis environment.ts
  private baseUrl = environment.lastfm.baseUrl;

  // Clé API Last.fm
  private apiKey = environment.lastfm.apiKey;

  // URL de callback après authentification
  private redirectUri = 'https://localhost:4200/callback';

  constructor(
    private http: HttpClient, // Pour les appels HTTP
    private router: Router    // Pour la navigation
  ) {}

  /**
   * login()
   * Redirige l'utilisateur vers la page d'authentification Last.fm
   * Last.fm utilise un flow par token — pas de PKCE nécessaire
   */
  login(): void {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      cb: this.redirectUri // URL de retour après connexion
    });

    // Redirection vers Last.fm pour que l'utilisateur autorise l'app
    window.location.href = `https://www.last.fm/api/auth?${params.toString()}`;
  }

  /**
   * handleCallback()
   * Last.fm renvoie un token dans l'URL après le login
   * On le stocke directement en sessionStorage (pas d'échange nécessaire)
   */
  handleCallback(token: string): void {
    if (token) {
      // Stockage du token et du provider actif
      sessionStorage.setItem('lastfm_token', token);
      sessionStorage.setItem('spotify_provider', 'lastfm'); // On réutilise la même clé provider
      this.router.navigate(['/loading']);
    } else {
      this.router.navigate(['/error']);
    }
  }

  /**
   * getTopArtists()
   * Récupère les top artistes d'un utilisateur Last.fm
   * @param username - Nom d'utilisateur Last.fm
   * @param period - Période : overall | 7day | 1month | 3month | 6month | 12month
   * @param limit - Nombre d'artistes à récupérer (max 50)
   */
  getTopArtists(username: string, period: string = '1month', limit: number = 10): Observable<any> {
    const params = new URLSearchParams({
      method: 'user.gettopartists', // Méthode API Last.fm
      user: username,
      period,
      limit: limit.toString(),
      api_key: this.apiKey,
      format: 'json'                // On veut du JSON, pas du XML (format par défaut de Last.fm)
    });

    return this.http.get(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * getTopTracks()
   * Récupère les top tracks d'un utilisateur Last.fm
   * @param username - Nom d'utilisateur Last.fm
   * @param period - Période : overall | 7day | 1month | 3month | 6month | 12month
   * @param limit - Nombre de tracks à récupérer (max 50)
   */
  getTopTracks(username: string, period: string = '1month', limit: number = 10): Observable<any> {
    const params = new URLSearchParams({
      method: 'user.gettoptracks',
      user: username,
      period,
      limit: limit.toString(),
      api_key: this.apiKey,
      format: 'json'
    });

    return this.http.get(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * getTopTags()
   * Récupère les genres (tags) les plus écoutés d'un utilisateur
   * Last.fm appelle les genres "tags"
   * @param username - Nom d'utilisateur Last.fm
   */
  getTopTags(username: string): Observable<any> {
    const params = new URLSearchParams({
      method: 'user.gettoptags',
      user: username,
      api_key: this.apiKey,
      format: 'json'
    });

    return this.http.get(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * getToken()
   * Retourne le token Last.fm stocké en sessionStorage
   */
  getToken(): string | null {
    return sessionStorage.getItem('lastfm_token');
  }

  /**
   * isLoggedIn()
   * Vérifie si l'utilisateur est connecté à Last.fm
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * logout()
   * Déconnecte l'utilisateur Last.fm
   */
  logout(): void {
    sessionStorage.removeItem('lastfm_token');
    sessionStorage.removeItem('spotify_provider');
    this.router.navigate(['/login']);
  }
}