import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LastfmService } from '../../services/auth/lastfm';

/**
 * LoadingComponent
 * Page de chargement affichée pendant la récupération des données Last.fm
 * Elle récupère les top artistes, top tracks et top tags
 * puis redirige vers le dashboard une fois tout chargé
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class Loading implements OnInit {

  // Messages rotatifs affichés pendant le chargement
  messages = [
    'Analyse de tes goûts douteux...',
    'L\'IA prépare son jugement...',
    'Comptage de tes artistes honteux...',
    'Calibration du sarcasme...',
    'Chargement de ta playlist secrète...'
  ];

  // Message actuellement affiché
  currentMessage = this.messages[0];

  // Index du message actuel
  private messageIndex = 0;

  // Interval pour la rotation des messages
  private messageInterval: any;

  constructor(
    private router: Router,
    private lastfmService: LastfmService
  ) {}

  /**
   * ngOnInit()
   * Lance le chargement des données dès que la page s'affiche
   */
  async ngOnInit(): Promise<void> {
    // On démarre la rotation des messages
    this.startMessageRotation();

    // On récupère le username stocké au login
    const username = sessionStorage.getItem('lastfm_username');

    if (!username) {
      // Pas de username = retour au login
      this.router.navigate(['/login']);
      return;
    }

    try {
      // Récupération des données en parallèle pour aller plus vite
      const [artists, tracks, tags] = await Promise.all([
        this.lastfmService.getTopArtists(username, '1month', 10).toPromise(),
        this.lastfmService.getTopTracks(username, '1month', 10).toPromise(),
        this.lastfmService.getTopTags(username).toPromise()
      ]);

      // On stocke les données en sessionStorage pour le dashboard
      sessionStorage.setItem('lastfm_artists', JSON.stringify(artists));
      sessionStorage.setItem('lastfm_tracks', JSON.stringify(tracks));
      sessionStorage.setItem('lastfm_tags', JSON.stringify(tags));

      // On arrête la rotation et on redirige
      this.stopMessageRotation();
      this.router.navigate(['/dashboard']);

    } catch (error) {
      // En cas d'erreur on redirige vers la page d'erreur
      this.stopMessageRotation();
      this.router.navigate(['/error']);
    }
  }

  /**
   * startMessageRotation()
   * Change le message toutes les 2 secondes
   */
  private startMessageRotation(): void {
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.currentMessage = this.messages[this.messageIndex];
    }, 2000);
  }

  /**
   * stopMessageRotation()
   * Arrête la rotation des messages
   */
  private stopMessageRotation(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }
}