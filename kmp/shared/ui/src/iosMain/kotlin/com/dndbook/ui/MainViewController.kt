package com.dndbook.ui

import androidx.compose.ui.window.ComposeUIViewController

/**
 * Creates the UIViewController that the Swift ContentView embeds.
 * Called from iosApp/ContentView.swift as MainViewControllerKt.MainViewController().
 */
fun MainViewController() = ComposeUIViewController { AppRoot() }
