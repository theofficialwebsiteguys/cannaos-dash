import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-tools',
  imports: [CommonModule, FormsModule],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css'
})
export class ToolsComponent {
  title: string = '';
  body: string = '';
  imageUrl: string = '';
  selectedFileName: string | null = null;
  selectedCategory: string = '';
  categories: string[] = ['PREROLL', 'EDIBLE', 'FLOWER', 'CONCENTRATES', 'BEVERAGE', 'TINCTURES', 'ACCESSORIES'];
  deliveryAvailable: boolean = false;
  carouselImages: string[] = [];
  expandedIndex: number | null = null;
  selectedImageFile: (File | undefined)[] = [];
  uploadedImagePreviewUrl: (string | undefined)[] = [];
  selectedIndex: number | null = null;
  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCarouselImages();
    this.getDeliveryEligibility();
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  clearNotificationForm() {
    this.title = '';
    this.body = '';
    this.imageUrl = '';
    this.selectedFileName = null;
  
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clears file input
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    console.log(file)

    if (file) {
      this.adminService.uploadImage(file).subscribe({
        next: (response) => {
          this.imageUrl = response.imageUrl; // Get public URL from backend
          console.log('Image uploaded, public URL:', this.imageUrl);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
        }
      });
    }
  }


  getDeliveryEligibility(): void {
    this.adminService.checkDeliveryEligibility().subscribe(response => {
      this.deliveryAvailable = response.deliveryAvailable;
    });
  }

  onToggleDelivery(): void {
    this.adminService.toggleDelivery().subscribe(response => {
      this.deliveryAvailable = response.deliveryAvailable;
    });
  }

  loadCarouselImages() {
    this.adminService.getCarouselImages().subscribe(response => {
      this.carouselImages = response.images.map(imgUrl => `${imgUrl}?v=${new Date().getTime()}`);
    });
  }

  toggleDropdown(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  onImageFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile[index] = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImagePreviewUrl[index] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  replaceImage(index: number) {
    if (!this.selectedImageFile[index]) return;

    this.adminService.replaceCarouselImage(this.selectedImageFile[index]!, index)
      .subscribe(response => {
        this.carouselImages[index] = `${response.imageUrl}?v=${new Date().getTime()}`;
        this.selectedImageFile[index] = undefined;
        this.uploadedImagePreviewUrl[index] = undefined;
      });
  }

  sendNotification() {
    if (!this.title || !this.body) {
        console.error('Title and body are required!');
        return;
    }

    if (this.selectedCategory) {
        // Send to a specific category group
        this.adminService.sendPushNotificationToCategory(this.title, this.body, this.selectedCategory, this.imageUrl)
            .subscribe({
                next: (response) => {
                    console.log('Category notification sent:', response);
                },
                error: (error) => {
                    console.error('Error sending category notification:', error);
                }
            });
    } else {
        // Send to all users
        this.adminService.sendPushNotificationToAll(this.title, this.body, this.imageUrl)
            .subscribe({
                next: (response) => {
                    console.log('Notification sent:', response);
                },
                error: (error) => {
                    console.error('Error sending notification:', error);
                }
            });
    }
}

}
