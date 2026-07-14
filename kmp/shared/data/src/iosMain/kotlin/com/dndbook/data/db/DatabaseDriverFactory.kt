package com.dndbook.data.db

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver
import com.dndbook.db.DndBookDatabase

actual class DatabaseDriverFactory {
    actual fun createDriver(): SqlDriver {
        val driver = NativeSqliteDriver(
            schema = DndBookDatabase.Schema,
            name = "dndbook.db",
        )
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        return driver
    }
}
