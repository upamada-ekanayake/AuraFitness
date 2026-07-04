import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.upamada.aurafitness",
  appName: "AuraFitness",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#09090b",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#09090b"
    }
  }
};

export default config;
