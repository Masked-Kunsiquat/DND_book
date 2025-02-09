migrate((app) => {
    let usersCollection = app.findCollectionByNameOrId("users");

    let record = new Record(usersCollection);

    // Load from environment variables or use defaults
    let adminEmail = $os.getenv("PB_ADMIN_EMAIL") || "admin@example.com";
    let adminPassword = $os.getenv("PB_ADMIN_PASSWORD") || "AdminSecret123";

    // Set user fields
    record.set("email", adminEmail);
    record.set("password", adminPassword);
    record.set("passwordConfirm", adminPassword);
    record.set("emailVisibility", true);
    record.set("verified", true);
    record.set("name", "Admin User");

    // Save user (validates fields)
    app.save(record);
}, (app) => {
    // Optional rollback (removes admin user if migration is undone)
    try {
        let record = app.findAuthRecordByEmail("users", "admin@example.com");
        app.delete(record);
    } catch {
        // Silent error if already deleted
    }
});
