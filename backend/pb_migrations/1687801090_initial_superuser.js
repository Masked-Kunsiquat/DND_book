migrate((app) => {
    let superusers = app.findCollectionByNameOrId("_superusers");

    let record = new Record(superusers);

    // Load credentials from environment variables
    record.set("email", $os.getenv("SUPERUSER_EMAIL") || "superadmin@example.com");
    record.set("password", $os.getenv("SUPERUSER_PASSWORD") || "SuperSecret123");

    app.save(record);
}, (app) => { // optional rollback
    try {
        let record = app.findAuthRecordByEmail("_superusers", $os.getenv("SUPERUSER_EMAIL") || "superadmin@example.com");
        app.delete(record);
    } catch {
        // Silent errors (probably already deleted)
    }
});
