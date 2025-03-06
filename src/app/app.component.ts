import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from '../../projects/admin-dashboard/src/lib/services/config.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private configService: ConfigService) {
   this.configService.setApiKey('c69203dbdeaf88d28f3bfa28afeaff32965744f3d3ae6321b9eff6d198b1edfb');
  }
}
