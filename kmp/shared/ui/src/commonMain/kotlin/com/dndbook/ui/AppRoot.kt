package com.dndbook.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.dndbook.ui.theme.AppTheme

/**
 * Root composable entry-point.
 *
 * Phase 0: displays a "DND Book" splash on a gray-900 background using the
 * app's seeded color palette.
 *
 * Phase 2+: this composable will host the NavHost with the full navigation graph.
 */
@Composable
fun AppRoot() {
    AppTheme(darkTheme = true) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "DND Book",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}
