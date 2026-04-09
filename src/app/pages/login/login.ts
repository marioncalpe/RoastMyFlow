import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';

/**
 * LoginComponent
 * Page d'accueil de l'application
 * Affiche les boutons de connexion Spotify et Last.fm
 * Délègue toute la logique d'auth à AuthService
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  // Contrôle l'affichage du spinner pendant la redirection OAuth
  isLoading = false;

  constructor(private authService: AuthService) {}

  /**
   * onSpotifyLogin()
   * Déclenché au clic sur "Se connecter avec Spotify"
   * Active le spinner puis lance le flow OAuth
   */
  async onSpotifyLogin(): Promise<void> {
    this.isLoading = true;
    await this.authService.loginWithSpotify();
  }

  /**
   * onLastfmLogin()
   * Déclenché au clic sur "Se connecter avec Last.fm"
   */
  onLastfmLogin(): void {
    this.isLoading = true;
    this.authService.loginWithLastfm();
  }
}