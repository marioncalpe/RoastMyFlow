import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * LoginComponent
 * Page d'accueil simplifiée — l'utilisateur entre son pseudo Last.fm
 * Pas d'OAuth, pas de token, juste un username stocké en sessionStorage
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  // Pseudo Last.fm entré par l'utilisateur
  username = '';

  // Message d'erreur affiché si le champ est vide
  errorMessage = '';

  // Spinner pendant la redirection
  isLoading = false;

  constructor(private router: Router) {}

  /**
   * onSubmit()
   * Vérifie que le pseudo n'est pas vide
   * Stocke le username en sessionStorage et redirige vers /loading
   */
  onSubmit(): void {
    if (!this.username.trim()) {
      this.errorMessage = 'Entre ton pseudo Last.fm pour continuer.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // On stocke le username pour l'utiliser dans les autres components
    sessionStorage.setItem('lastfm_username', this.username.trim());
    sessionStorage.setItem('spotify_provider', 'lastfm');

    this.router.navigate(['/loading']);
  }
}