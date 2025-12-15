# Prize Image Upload Feature 🖼️

## ✅ Feature Complete

The admin dashboard now supports uploading prize images from the computer instead of typing URLs. Images are converted to Base64 and stored in localStorage.

---

## 🎯 What Was Added

### Before:
```html
<!-- Text input for URLs -->
<label>Image URL</label>
<input type="text" value="https://example.com/image.png" />
```

### After:
```html
<!-- File input with preview -->
<label>Prize Image</label>
<input type="file" accept="image/*" onchange="handleImageUpload('daily', this)" />
<div class="prize-preview">
  <img id="daily-preview" src="..." />
</div>
```

---

## 📝 Changes Made

### 1. **HTML Updates** (`admin.html`)

#### Replaced Text Inputs with File Inputs:
```html
<div class="form-group">
  <label>Prize Image</label>
  <input 
    type="file" 
    class="form-control file-input" 
    id="daily-image" 
    accept="image/*"
    onchange="handleImageUpload('daily', this)"
  />
  <small style="color: rgba(0, 255, 170, 0.6);">
    Upload an image or leave empty to keep current image
  </small>
</div>
```

#### Added Styling for File Inputs:
```css
.file-input {
  cursor: pointer;
  padding: 10px;
}

.file-input::file-selector-button {
  background: rgba(0, 255, 170, 0.15);
  border: 1px solid rgba(0, 255, 170, 0.45);
  color: rgba(0, 255, 170, 0.95);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Exo 2', sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(0, 255, 170, 0.3);
}

.file-input::file-selector-button:hover {
  background: rgba(0, 255, 170, 0.25);
  box-shadow: 0 0 12px rgba(0, 255, 170, 0.35);
}
```

#### Enhanced Preview Styling:
```css
.prize-preview {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prize-preview img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
  border: 1px solid rgba(0, 255, 170, 0.25);
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.2);
}
```

### 2. **JavaScript Updates** (`admin.html`)

#### Added Image Storage Object:
```javascript
// Store Base64 images in memory (keyed by prize type)
const uploadedImages = {
  daily: null,
  weekly: null,
  monthly: null
};
```

#### Added Image Upload Handler:
```javascript
function handleImageUpload(type, input) {
  const file = input.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    input.value = '';
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image file size must be less than 2MB');
    input.value = '';
    return;
  }

  // Read and convert to Base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64String = e.target.result;
    
    // Store in memory
    uploadedImages[type] = base64String;
    
    // Update preview
    const previewImg = document.getElementById(`${type}-preview`);
    if (previewImg) {
      previewImg.src = base64String;
      previewImg.style.display = 'block';
    }
    
    console.log(`Image uploaded for ${type} prize (${(file.size / 1024).toFixed(2)} KB)`);
  };
  
  reader.onerror = function() {
    alert('Failed to read image file');
    input.value = '';
  };
  
  reader.readAsDataURL(file);
}
```

#### Updated Save Function:
```javascript
function savePrize(type) {
  // Get existing prize data to preserve image if no new upload
  const existing = localStorage.getItem(`prize_${type}`);
  let existingImage = null;
  if (existing) {
    try {
      existingImage = JSON.parse(existing).image;
    } catch (e) {}
  }

  const prizeData = {
    name: document.getElementById(`${type}-name`).value,
    value: document.getElementById(`${type}-value`).value,
    // Use uploaded Base64 image if available, otherwise keep existing
    image: uploadedImages[type] || existingImage || DEFAULT_PRIZES[type].image,
    cap: parseInt(document.getElementById(`${type}-cap`).value)
  };

  localStorage.setItem(`prize_${type}`, JSON.stringify(prizeData));
  // ... rest of save logic
}
```

#### Updated Load Function:
```javascript
function loadPrizeData() {
  ['daily', 'weekly', 'monthly'].forEach(type => {
    const stored = localStorage.getItem(`prize_${type}`);
    const prizeData = stored ? JSON.parse(stored) : DEFAULT_PRIZES[type];

    document.getElementById(`${type}-name`).value = prizeData.name || '';
    document.getElementById(`${type}-value`).value = prizeData.value || '';
    document.getElementById(`${type}-cap`).value = prizeData.cap || 0;
    
    // Load and display existing image (including Base64)
    if (prizeData.image) {
      uploadedImages[type] = prizeData.image;
      const previewImg = document.getElementById(`${type}-preview`);
      if (previewImg) {
        previewImg.src = prizeData.image;
        previewImg.style.display = 'block';
      }
    }
  });
}
```

#### Updated Reset Function:
```javascript
function resetPrize(type) {
  if (confirm(`Reset ${type} prize to default values?`)) {
    const defaultData = DEFAULT_PRIZES[type];
    
    document.getElementById(`${type}-name`).value = defaultData.name;
    document.getElementById(`${type}-value`).value = defaultData.value;
    document.getElementById(`${type}-cap`).value = defaultData.cap;
    
    // Clear file input
    document.getElementById(`${type}-image`).value = '';
    
    // Reset to default image
    uploadedImages[type] = defaultData.image;
    const previewImg = document.getElementById(`${type}-preview`);
    if (previewImg && defaultData.image) {
      previewImg.src = defaultData.image;
      previewImg.style.display = 'block';
    } else if (previewImg) {
      previewImg.style.display = 'none';
    }

    localStorage.setItem(`prize_${type}`, JSON.stringify(defaultData));
    
    showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} prize reset to defaults!`);
  }
}
```

### 3. **Main App Updates** (`script.js`)

#### Enhanced Image Display:
```javascript
function updatePrizeImage(type, imageUrl) {
  if (!imageUrl) return;
  
  // Update home tab card image
  const homeImgEl = document.querySelector(`#card-${type} .prize-image`);
  if (homeImgEl) {
    homeImgEl.src = imageUrl;
    // Handle Base64 images
    if (imageUrl.startsWith('data:image')) {
      homeImgEl.style.objectFit = 'contain';
    }
  }
  
  // Update individual tab card image
  const tabImgEl = document.querySelector(`#card-${type}-tab .pq-card__prize-image`);
  if (tabImgEl) {
    tabImgEl.src = imageUrl;
    // Handle Base64 images
    if (imageUrl.startsWith('data:image')) {
      tabImgEl.style.objectFit = 'contain';
    }
  }
}
```

---

## 🔄 How It Works

### Admin Uploads Image:
```
1. Admin opens admin.html
2. Clicks "Choose File" button
3. Selects image from computer (e.g., ps5.png)
4. Image is validated:
   - Must be image type (jpeg, png, gif, webp, etc.)
   - Must be under 2MB
5. FileReader converts to Base64:
   data:image/png;base64,iVBORw0KGgoAAAANS...
6. Preview shows immediately (100x100 thumbnail)
7. Clicks "Save"
8. Base64 string stored in localStorage:
   prize_daily: { name, value, image: "data:image/png;base64...", cap }
```

### Main App Displays Image:
```
1. User opens index.html
2. loadPrizeConfigurations() reads localStorage
3. Finds image: "data:image/png;base64..."
4. updatePrizeImage() applies to UI:
   - Home tab card
   - Individual tab card
5. Image displays correctly with object-fit: contain
6. Works after refresh (persistent)
```

---

## 🎨 Features

### ✅ File Upload
- Click "Choose File" button
- Select any image format (PNG, JPG, GIF, WEBP, etc.)
- Instant validation and feedback

### ✅ Image Preview
- 100x100 thumbnail preview
- Appears immediately after selection
- Neon-themed border and glow effect
- Centered in preview area

### ✅ Base64 Conversion
- FileReader API converts to Base64
- Data URL format: `data:image/png;base64,iVBORw0K...`
- No external server needed
- Works offline

### ✅ Validation
- File type check (must be image)
- File size check (max 2MB)
- Clear error messages
- Input cleared on validation failure

### ✅ Storage
- Saved in localStorage
- Persists across sessions
- Falls back to default if no image
- Preserves existing image if not changed

### ✅ Display
- Shows on both home and individual tabs
- Auto-adjusts with object-fit: contain
- Handles URL and Base64 sources
- Responsive sizing

### ✅ Reset
- "Reset" button restores default image
- Clears file input
- Updates preview immediately
- Confirms before resetting

---

## 🧪 Testing Scenarios

### Test 1: Upload New Image
```
1. Open admin.html
2. Login with "admin123"
3. Click "Choose File" on Daily Prize
4. Select a PNG image (< 2MB)
5. See preview appear immediately
6. Click "Save"
7. Success modal shows
8. Refresh admin.html
9. Preview still shows uploaded image ✓
10. Open index.html
11. Daily prize shows new image ✓
```

### Test 2: Upload Large Image
```
1. Select image > 2MB
2. Alert: "Image file size must be less than 2MB"
3. File input cleared
4. Preview unchanged ✓
```

### Test 3: Upload Non-Image
```
1. Select PDF or text file
2. Alert: "Please select a valid image file"
3. File input cleared
4. Preview unchanged ✓
```

### Test 4: Save Without Upload
```
1. Don't upload new image
2. Change prize name to "PS5 Digital"
3. Click "Save"
4. Existing image preserved ✓
5. Name updated ✓
```

### Test 5: Reset Prize
```
1. Upload custom image
2. Click "Reset"
3. Confirm dialog appears
4. Confirm reset
5. File input cleared
6. Preview shows default image
7. All fields reset to defaults ✓
```

### Test 6: Multiple Prizes
```
1. Upload image for Daily prize (PS5)
2. Upload image for Weekly prize (Xbox)
3. Upload image for Monthly prize (Switch)
4. Save all three
5. Open index.html
6. All three show custom images ✓
7. Each preview correct ✓
```

### Test 7: Persistence
```
1. Upload image and save
2. Close admin.html
3. Close browser entirely
4. Reopen admin.html
5. Login again
6. Preview shows uploaded image ✓
7. Open index.html
8. Prize shows uploaded image ✓
```

### Test 8: Base64 Display
```
1. Upload transparent PNG
2. Transparency preserved ✓
3. Upload animated GIF
4. Animation preserved ✓
5. Upload WEBP
6. Format supported ✓
```

---

## 📊 Technical Details

### File Size Limit:
```javascript
// Max 2MB per image
if (file.size > 2 * 1024 * 1024) {
  alert('Image file size must be less than 2MB');
  return;
}
```

### Accepted Formats:
```html
<input type="file" accept="image/*" />
<!-- Accepts: PNG, JPG, JPEG, GIF, WEBP, BMP, SVG, etc. -->
```

### Base64 Encoding:
```javascript
const reader = new FileReader();
reader.onload = function(e) {
  const base64String = e.target.result;
  // Result: "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."
};
reader.readAsDataURL(file);
```

### Storage Format:
```javascript
{
  "name": "PlayStation 5 Digital Edition",
  "value": "$399.99",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "cap": 150
}
```

### localStorage Size:
```
- Typical limit: 5-10 MB per domain
- Base64 overhead: ~33% larger than original
- 1 MB image → ~1.3 MB Base64
- Can store ~3-7 images safely
```

---

## 🎯 Benefits

### 1. **Ease of Use**
- No need to host images externally
- No need to type long URLs
- Direct file selection from computer
- Instant preview feedback

### 2. **Offline Support**
- Images stored locally
- No external dependencies
- Works without internet
- Fast loading

### 3. **Persistence**
- Survives page refresh
- Survives browser restart
- Stored in localStorage
- No server needed

### 4. **Validation**
- File type checking
- File size limiting
- Error handling
- User-friendly messages

### 5. **Flexibility**
- Supports all image formats
- Easy to update
- Easy to reset
- Preserves existing on no change

---

## 💡 Usage Tips

### For Admins:
```
✓ Use compressed images (< 500 KB recommended)
✓ Use square or landscape orientation
✓ Test preview before saving
✓ Reset if image looks wrong
✓ Use PNG for transparency
✓ Use JPG for photos
```

### For Testing:
```
✓ Use small test images first
✓ Try different formats
✓ Test validation errors
✓ Verify persistence
✓ Check both tabs
✓ Test reset functionality
```

### For Production:
```
✓ Optimize images before upload
✓ Keep images under 1 MB
✓ Use appropriate formats
✓ Test on mobile devices
✓ Verify after refresh
✓ Document image sources
```

---

## 🔧 Troubleshooting

### Preview Not Showing:
```
- Check file size (must be < 2MB)
- Check file type (must be image)
- Check browser console for errors
- Verify FileReader support
```

### Image Not Persisting:
```
- Check localStorage quota
- Clear other localStorage data if full
- Check browser localStorage settings
- Verify JSON.stringify/parse working
```

### Image Not Displaying on Main App:
```
- Refresh index.html after saving
- Check browser console for errors
- Verify image data in localStorage
- Check network tab for 404s (shouldn't be any)
```

### Image Quality Issues:
```
- Use smaller, optimized images
- Avoid very large dimensions
- Compress before upload
- Use appropriate format (PNG/JPG)
```

---

## ✅ Complete Feature List

- [x] Replace URL input with file input
- [x] FileReader converts to Base64
- [x] Instant preview (100x100 thumbnail)
- [x] Validates file type (must be image)
- [x] Validates file size (max 2MB)
- [x] Stores Base64 in localStorage
- [x] Displays on main app (home tab)
- [x] Displays on main app (individual tabs)
- [x] Persists across refresh
- [x] Falls back to default if no image
- [x] Preserves existing if not changed
- [x] Reset clears and restores default
- [x] Neon-themed styling
- [x] Success modal on save
- [x] Handles all image formats
- [x] Works for all three prizes
- [x] No linter errors

---

## 🚀 Example Workflow

### Complete Upload Process:
```
1. Open admin.html
   ✓ Login screen appears

2. Enter password "admin123"
   ✓ Dashboard loads

3. Scroll to Daily Prize section
   ✓ See current prize details

4. Click "Choose File"
   ✓ File browser opens

5. Select ps5-digital.png (500 KB)
   ✓ File selected

6. Preview appears immediately
   ✓ 100x100 thumbnail with neon glow

7. Update prize name: "PS5 Digital Edition"
   ✓ Text field updated

8. Update value: "$399.99"
   ✓ Text field updated

9. Update cap: 20
   ✓ Number field updated

10. Click "💾 Save"
    ✓ Success modal appears

11. Close modal
    ✓ Returns to dashboard

12. Refresh admin.html
    ✓ Image still showing in preview
    ✓ All fields preserved

13. Open index.html in new tab
    ✓ Daily prize shows new image
    ✓ Name shows "PS5 Digital Edition"
    ✓ Counter shows "0/20"

14. Add 20 entries
    ✓ Redirects to claw machine at 20/20
    ✓ PS5 image visible in claw machine

15. Complete ✓
```

---

## ✅ Status: Fully Functional 🎉

The image upload feature is complete and working! Admins can now upload images from their computer, see instant previews, and have those images display on the main app with full persistence.

**No external hosting required!** 🚀

