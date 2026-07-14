package com.dndbook.data.db

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.dndbook.db.DndBookDatabase

actual class DatabaseDriverFactory(private val context: Context) {
    actual fun createDriver(): SqlDriver {
        val driver = AndroidSqliteDriver(
            schema = DndBookDatabase.Schema,
            context = context,
            name = "dndbook.db",
        )
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        return driver
    }
}
