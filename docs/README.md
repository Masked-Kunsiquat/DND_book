# 📖 Docs Directory Standards
**Directory**: `docs/`

This guide outlines how the `docs/` directory is used in this project, covering its purpose, structure, and GitHub Pages deployment setup.

---

## 1️⃣ Purpose of the `docs/` Directory
The `docs/` directory serves two main functions:
- **📸 Storing Images** – Screenshots and assets for the root `README.md`.
- **🌍 GitHub Pages Deployment** – Used for publishing project documentation.

---

## 2️⃣ Directory Structure
```bash
docs/
├── img/            # Screenshots and static assets for documentation
├── index.md        # Landing page for GitHub Pages (optional, if using Markdown-based docs)
├── assets/         # Additional non-image assets (if needed)
└── .nojekyll       # Ensures GitHub Pages processes directories starting with `_`
```

### **Image Storage Example**
✅ **Use `docs/img/` for screenshots** referenced in `README.md`:
```markdown
![App Screenshot](docs/img/screenshot.png)
```

---

## 3️⃣ Publishing with GitHub Pages (`docs/` Folder Method)
This project uses the **`docs/` folder method** for GitHub Pages deployment.

🔹 **Steps to Enable It:**
1. Go to **Settings > Pages** in your GitHub repo.
2. Under "Source," select **Deploy from a branch**.
3. Set the branch to `main` and the folder to `/docs`.
4. Save and wait for GitHub Pages to update.

### ✅ **Why Use the `docs/` Folder Instead of a Separate Branch?**
| **Advantage**            | **Benefit** |
|--------------------------|-------------|
| ✅ No extra branch needed | Keeps repository clean |
| ✅ Easier to manage docs  | No need to push to a separate branch |
| ✅ Faster updates         | Changes go live as soon as `docs/` is updated |

---

## 4️⃣ Best Practices & Maintenance
- **Keep all images/screenshots inside `docs/img/`.**  
- **For markdown-based docs, store `.md` files inside `docs/`.**  
- **Ensure `.nojekyll` is present to prevent GitHub Pages issues.**  
- **Regularly clean up unused images to keep `docs/` organized.**  

