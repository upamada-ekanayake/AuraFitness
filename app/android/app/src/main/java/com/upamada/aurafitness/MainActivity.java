package com.upamada.aurafitness;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int SYSTEM_BAR_COLOR = Color.rgb(9, 9, 11);

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    applyDarkSystemBars();
  }

  private void applyDarkSystemBars() {
    Window window = getWindow();
    WindowCompat.setDecorFitsSystemWindows(window, false);
    window.setStatusBarColor(SYSTEM_BAR_COLOR);
    window.setNavigationBarColor(SYSTEM_BAR_COLOR);

    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
      window.setStatusBarContrastEnforced(false);
      window.setNavigationBarContrastEnforced(false);
    }

    WindowInsetsControllerCompat controller =
      WindowCompat.getInsetsController(window, window.getDecorView());
    controller.setAppearanceLightStatusBars(false);
    controller.setAppearanceLightNavigationBars(false);
  }
}
