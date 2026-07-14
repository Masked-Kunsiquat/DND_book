package com.dndbook.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.dndbook.ui.AppRoot

/**
 * Single-activity host for the Compose Multiplatform UI.
 *
 * setContent delegates entirely to [AppRoot] in :shared:ui so that all
 * screen logic lives in commonMain and is shared with iOS.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AppRoot()
        }
    }
}
