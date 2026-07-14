package com.dndbook.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ─── App palette (from mobile/src/theme/colors.ts) ───────────────────────────

/** Background / surface darks */
val Gray900 = Color(0xFF111827)
val Gray800 = Color(0xFF1F2937)
val Gray700 = Color(0xFF374151)
val Gray600 = Color(0xFF4B5563)
val Gray400 = Color(0xFF9CA3AF)
val Gray200 = Color(0xFFE5E7EB)

/** Brand primary — blue */
val Primary500 = Color(0xFF3B82F6)  // #3b82f6
val Primary400 = Color(0xFF60A5FA)
val Primary700 = Color(0xFF1D4ED8)

/** Accent / error */
val Red500 = Color(0xFFEF4444)

// ─── Color schemes ────────────────────────────────────────────────────────────

private val DarkColorScheme = darkColorScheme(
    primary = Primary500,
    onPrimary = Color.White,
    primaryContainer = Primary700,
    onPrimaryContainer = Primary400,
    background = Gray900,
    onBackground = Gray200,
    surface = Gray800,
    onSurface = Gray200,
    surfaceVariant = Gray700,
    onSurfaceVariant = Gray400,
    error = Red500,
    onError = Color.White,
)

private val LightColorScheme = lightColorScheme(
    primary = Primary500,
    onPrimary = Color.White,
    primaryContainer = Primary400,
    onPrimaryContainer = Primary700,
    background = Color.White,
    onBackground = Gray900,
    surface = Gray200,
    onSurface = Gray900,
    surfaceVariant = Gray200,
    onSurfaceVariant = Gray700,
    error = Red500,
    onError = Color.White,
)

// ─── AppTheme ─────────────────────────────────────────────────────────────────

/**
 * Top-level theme composable.
 *
 * [darkTheme] defaults to true — matching the Expo app's default dark theme.
 * In Phase 4 this will read from DataStore (`THEME_MODE`) instead of a
 * hard-coded parameter.
 */
@Composable
fun AppTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        content = content,
    )
}
