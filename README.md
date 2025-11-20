# YGO Deck Builder

游戏王卡组编辑器

遊戯王デッキビルダー

Demo：[raye.mistivia.com/ygodeck](https://raye.mistivia.com/ygodeck/#o6lXBaOpVwWjqVcFg0dLBfn5ewBwUKcCUuc5BI2UeADUmP0BrvTMAjkebAKufHMEXWh5BeFWRAJwhCsDvadvAUpwSQMS2aACgJaYAJSWmACKlpgAGXcGAHNnwQVgUk0Bhz2DA6G7BgUIMTwBgYVnAzKRLQQBS+AFKWGQA62pWwAuye8Bl3MqBKtuXAWYhMIEEtFCBdCWmADalpgA3+4aBd2y4wE=!0iNuAeEF3wXuZyIC6+mlA4uXFwDUD4MBHFb0BHebkwI=!)

## Screenshot

![image](https://oss.nebula.moe/shared-files/2025/03/13/e758a78eab/ygodeckbuilder-screenshot.png)

## Deployment

This project includes a GitHub Action for automatic deployment to Firebase Hosting.

### Setup Instructions

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Firebase Hosting for your project

2. **Configure Firebase Project ID**
   - Update `.firebaserc` with your Firebase project ID:
     ```json
     {
       "projects": {
         "default": "your-firebase-project-id"
       }
     }
     ```

3. **Set up GitHub Secrets**
   
   Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):
   
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON key
     - Generate this in Firebase Console → Project Settings → Service Accounts
     - Click "Generate new private key"
     - Copy the entire JSON content
   
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
     - Find this in Firebase Console → Project Settings

4. **Deploy**
   - Push to the `main` branch, or
   - Manually trigger the workflow from GitHub Actions tab

The workflow will automatically build and deploy your app to Firebase Hosting.
