import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';

/**
 * CallbackComponent
 * Page intermédiaire invisible pour l'utilisateur
 * Elle est appelée automatiquement après le login Spotify ou Last.fm
 * Son seul rôle : récupérer le code/token dans l'URL et le transmettre à AuthService
 */
@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.html',
  styleUrl: './callback.scss'
})
export class Callback implements OnInit {

  // Message affiché pendant le traitement du callback
  message = 'Authentification en cours...';

  constructor(private authService: AuthService) {}

  /**
   * ngOnInit()
   * Lancé automatiquement au chargement du component
   * On traite immédiatement le callback dès que la page est chargée
   */
  async ngOnInit(): Promise<void> {
    try {
      await this.authService.handleCallback();
    } catch (error) {
      // En cas d'erreur on affiche un message et on laisse AuthService
      // rediriger vers /error
      this.message = 'Une erreur est survenue...';
    }
  }
}