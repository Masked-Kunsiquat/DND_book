package com.dndbook.data.db

import com.dndbook.db.DndBookDatabase

fun createDatabase(driverFactory: DatabaseDriverFactory): DndBookDatabase {
    val driver = driverFactory.createDriver()
    return DndBookDatabase(driver)
}
