# Admin Dashboard - PrizeQuest

## 🎮 Overview

The Admin Dashboard allows you to manage all prize configurations without editing code. Changes made in the admin panel automatically reflect in the main app after refresh.

---

## 🔐 Authentication

### Default Credentials:
- **Password**: `admin123`
- **Hash Algorithm**: SHA-256
- **Storage**: Session-based (persists until browser close)

### Security Notes:
- Password stored as SHA-256 hash in localStorage
- Authentication state stored in sessionStorage
- Default password can be changed (future feature)
- Logout clears session

---

## 🎁 Prize Management

### Editable Fields per Prize:

1. **Prize Name**
   - Example: "$10 Amazon Gift Card"
   - Shows in home tab and individual raffle tabs
   - Used in claw machine winner reveal

2. **Prize Value**
   - Example: "$10", "$50", "$349.99"
   - Optional display field
   - For reference/future use

3. **Image URL**
   - Accepts full URLs or relative paths
   - Example: `https://...` or `./images/ps5.avif`
   - Leave empty for no image (weekly default)
   - Preview updates in real-time

4. **Max Entries (Cap)**
   - Number of entries to trigger winner draw
   - Daily default: 150
   - Weekly default: 500
   - Monthly default: 5000
   - Minimum: 1

---

## 💾 Storage Structure

### LocalStorage Keys:

```javascript
// Prize configurations
prize_daily: {
  "name": "$10 Amazon Gift Card",
  "value": "$10",
  "image": "https://...",
  "cap": 150
}

prize_weekly: {
  "name": "$50 Gift Card",
  "value": "$50",
  "image": "",
  "cap": 500
}

prize_monthly: {
  "name": "Nintendo Switch OLED Model",
  "value": "$349.99",
  "image": "./images/switch.avif",
  "cap": 5000
}

// Admin authentication
adminPasswordHash: "240be518..." // SHA-256 hash

// Session authentication (sessionStorage)
adminAuthenticated: "true"
```

---

## 🔄 How Changes Apply

### Save Flow:
```
1. User clicks "Save" on prize card
   ↓
2. Data saved to localStorage: prize_[type]
   ↓
3. Cap updated in raffleState if exists
   ↓
4. Success modal appears
   ↓
5. On index.html refresh:
   - loadPrizeConfigurations() runs
   - Prize names updated in prizeNames object
   - Caps updated in raffles object
   - applyPrizeConfigurationsToUI() runs
   - UI elements updated (names, images)
```

### Reset Flow:
```
1. User clicks "Reset" button
   ↓
2. Confirmation dialog appears
   ↓
3. Default values restored from DEFAULT_PRIZES
   ↓
4. localStorage updated
   ↓
5. Preview images refreshed
   ↓
6. Success message shown
```

---

## 📊 Dashboard Statistics

### Real-time Stats:
1. **Total Entries**: Sum of all entries across all prizes
2. **Active Prizes**: Always shows 3 (Daily, Weekly, Monthly)
3. **Surveys Completed**: Total surveys across all prizes

Stats refresh automatically after saving any prize.

---

## 🎨 Features

### Image Previews:
- **Daily Prize**: Always shows preview
- **Weekly Prize**: Shows "No image" placeholder if empty
- **Monthly Prize**: Always shows preview
- **Real-time Update**: Preview changes as you type

### Form Validation:
- Prize name: Required
- Max entries: Minimum value of 1
- Image URL: Optional (can be empty)
- All fields validated on save

### Success Notifications:
- Modal appears after save
- Shows confirmation message
- Auto-updates stats
- Click "Continue" to dismiss

---

## 🧪 Testing Examples

### Example 1: Change Monthly Prize to PS5
```
1. Login with "admin123"
2. Scroll to Monthly Prize card
3. Update fields:
   - Name: "PlayStation 5 Digital Edition"
   - Value: "$449.99"
   - Image: "./images/ps5.avif"
   - Cap: 5000
4. Click "Save"
5. Refresh index.html
6. Expected: Monthly tab now shows PS5
```

### Example 2: Add Image to Weekly Prize
```
1. Login to admin panel
2. Find Weekly Prize card
3. Add image URL: "https://example.com/giftcard.jpg"
4. Click "Save"
5. Refresh index.html
6. Expected: Weekly prize now shows image
```

### Example 3: Lower Daily Cap for Testing
```
1. Login to admin panel
2. Find Daily Prize card
3. Change cap: 150 → 5
4. Click "Save"
5. Go to index.html
6. Add 5 entries to Daily prize
7. Expected: Auto-redirect to claw machine
```

### Example 4: Reset All to Defaults
```
1. Login to admin panel
2. Click "Reset" on each prize card
3. Confirm each reset
4. Expected: All prizes return to original values
```

---

## 🔧 Technical Implementation

### Main Functions:

```javascript
// admin.html
loadPrizeData()          // Load saved configs into form
savePrize(type)          // Save prize to localStorage
resetPrize(type)         // Reset to defaults
updatePreviews()         // Update image previews
loadStats()              // Load entry/survey counts

// script.js
loadPrizeConfigurations()     // Read configs from localStorage
applyPrizeConfigurationsToUI() // Apply to DOM
updatePrizeName(type, name)    // Update name in cards
updatePrizeImage(type, url)    // Update image in cards
updatePrizeValue(type, value)  // Update value display
```

### Integration Points:

**script.js initialization:**
```javascript
// Step 1: Load prize configs (names, images, caps)
loadPrizeConfigurations();

// Step 2: Load raffle state (entries, surveys)
loadRaffleState();

// Step 3: Apply configs to UI
applyPrizeConfigurationsToUI();

// Step 4: Update all UIs
updateRaffleUI("daily");
updateRaffleUI("weekly");
updateRaffleUI("monthly");
```

---

## 📝 Files Modified

### 1. `admin.html` (NEW)
**Purpose**: Admin dashboard interface
**Features**:
- Login form with password protection
- Prize editing forms (3 cards)
- Image previews
- Stats overview
- Save/Reset buttons
- Success modal

### 2. `script.js`
**Changes Added**:
- `loadPrizeConfigurations()` - Load configs on startup
- `applyPrizeConfigurationsToUI()` - Apply to DOM
- `updatePrizeName()` - Update names in cards
- `updatePrizeImage()` - Update images in cards
- `updatePrizeValue()` - Update value displays
- Called during DOMContentLoaded initialization

### 3. `index.html`
**Changes Added**:
- Admin link in header (⚙️ Admin button)
- Links to admin.html

---

## 🎯 Use Cases

### 1. Seasonal Prize Updates
```
Change monthly prize from Switch to:
- Summer: "Beach Vacation Package"
- Winter: "Gaming PC"
- Holiday: "Special Holiday Bundle"
```

### 2. Special Events
```
Update daily prize for promotion:
- Regular: "$10 Amazon Gift Card"
- Event: "$25 Special Event Gift Card"
```

### 3. Testing & Development
```
Lower caps for quick testing:
- Daily: 150 → 3
- Weekly: 500 → 5
- Monthly: 5000 → 10
```

### 4. Prize Pool Management
```
Adjust caps based on budget:
- Increase cap when more entries needed
- Decrease cap for faster draws
```

---

## ⚙️ Configuration Tips

### Image URLs:
- **External**: Use full HTTPS URLs
- **Local**: Use relative paths (`./images/...`)
- **CDN**: Use CDN links for better performance
- **Format**: Support all web formats (jpg, png, avif, webp)

### Prize Names:
- Keep concise for better display
- Include key details (value, brand)
- Use title case for consistency
- Examples:
  - ✅ "PlayStation 5 Digital Edition"
  - ✅ "$50 Amazon Gift Card"
  - ❌ "playstation 5 digital edition bundle with extra controller and games"

### Entry Caps:
- **Daily**: 50-200 (quick turnover)
- **Weekly**: 300-1000 (moderate)
- **Monthly**: 3000-10000 (large pool)
- Consider user engagement rate
- Lower caps = more frequent draws
- Higher caps = bigger anticipation

---

## 🔒 Security Considerations

### Current Implementation:
- ✅ Password hashing (SHA-256)
- ✅ Session-based auth
- ✅ Client-side validation
- ⚠️ No server-side validation
- ⚠️ No role-based access
- ⚠️ No audit logging

### Future Enhancements:
1. **Server-side auth**: Verify with backend API
2. **Role management**: Admin, moderator, viewer roles
3. **Audit logs**: Track who changed what and when
4. **Password change**: Allow admin to update password
5. **Multi-factor auth**: Add 2FA for extra security

---

## 📋 Quick Reference

### Access Admin Panel:
```
URL: /admin.html
Password: admin123
```

### Update Prize:
```
1. Login
2. Edit fields
3. Click "Save"
4. Refresh main app
```

### Reset Prize:
```
1. Login
2. Click "Reset"
3. Confirm
4. Refresh main app
```

### View Stats:
```
Stats auto-refresh after saves
Located at top of dashboard
Shows real-time data
```

---

## ✅ Checklist

- [x] Admin dashboard created
- [x] Password authentication implemented
- [x] Prize editing forms functional
- [x] Image previews working
- [x] Save/Reset buttons operational
- [x] LocalStorage integration complete
- [x] Main app reads admin configs
- [x] Success modal implemented
- [x] Stats display working
- [x] Logout functionality added
- [x] Responsive design applied
- [x] No linter errors
- [x] Documentation complete

---

## 🚀 Ready for Use!

The admin dashboard is fully functional and ready for managing prize configurations. All changes automatically apply to the main app after refresh.

**Next Steps**:
1. Test admin panel with different configurations
2. Update prizes for your specific needs
3. Consider adding server-side validation
4. Implement audit logging for changes

**Happy managing!** 🎉

