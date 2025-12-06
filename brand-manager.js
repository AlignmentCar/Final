




/**
 * ==========================================
 * SECTION 1: NAVIGATION FUNCTIONS
 * ==========================================
 */

function navigateToBrands() {
  console.log('🏷️ Navigating to Brands');
  
  currentPage = 'brands';
  
  // === STEP 1: Get page elements ===
  const mainApp = document.getElementById('mainApp');
  const allProductsPage = document.getElementById('allProductsPage');
  const productGroupsPage = document.getElementById('productGroupsPage');
  const customersPage = document.getElementById('customersPage');
  const brandsPage = document.getElementById('brandsPage');
  const groupDetailPage = document.getElementById('groupDetailPage');
  
  // === STEP 2: Hide all other pages ===
  if (mainApp) {
    mainApp.style.display = 'none';
    mainApp.classList.remove('active');
  }
  
  if (allProductsPage) {
    allProductsPage.classList.remove('active');
    allProductsPage.style.display = 'none';
  }
  
  if (productGroupsPage) {
    productGroupsPage.classList.remove('active');
    productGroupsPage.style.display = 'none';
  }
  
  if (customersPage) {
    customersPage.classList.remove('active');
    customersPage.style.display = 'none';
  }
  
  if (groupDetailPage) {
    groupDetailPage.classList.remove('active');
    groupDetailPage.style.display = 'none';
  }
  
  // === STEP 3: Show brands page ===
  if (brandsPage) {
    brandsPage.classList.add('active');
    brandsPage.style.display = 'block';
    console.log('✅ Brands page displayed');
  } else {
    console.error('❌ brandsPage element not found!');
    return;
  }
  
  // === STEP 4: Hide the blue navbar ===
  const navbar = document.querySelector('.navbar.navbar-dark.bg-primary');
  if (navbar) {
    navbar.style.display = 'none';
  }
  
  // === STEP 5: Clear search input ===
  const searchInput = document.getElementById('searchBrandsInput');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // === STEP 6: Load brands from Firebase ===
  if (typeof loadBrands === 'function') {
    loadBrands();
    console.log('✅ Brands data loading...');
  } else {
    console.warn('⚠️ loadBrands function not found');
  }
  
  // === STEP 7: Close sidebar and scroll ===
  if (typeof closeSidebar === 'function') {
    closeSidebar();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * ==========================================
 * SECTION 2: DATA LOADING FUNCTIONS
 * ==========================================
 */

/**
 * Load Brands from Firebase
 */
async function loadBrands() {
  try {
    console.log('📡 Fetching brands from Firebase...');
    
    const user = window.auth.currentUser;
    
    if (!user) {
      console.error('❌ No user authenticated');
      throw new Error('Please sign in first');
    }
    
    const { collection, getDocs } = window.firebaseImports;
    const userId = user.uid;
    
    // Get brands collection reference
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    const brandsSnap = await getDocs(brandsRef);
    
    // Extract brand names
    brandsCache = [];
    brandsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        brandsCache.push(data.name);
      }
    });
    
    console.log('✅ Loaded', brandsCache.length, 'brands from Firebase');
    
    // Render immediately
    renderBrandsList();
    
  } catch (error) {
    console.error('❌ Error loading brands:', error);
    
    // Show error message
    const container = document.getElementById('brandsListContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#dc3545;">
          <i class="bi bi-exclamation-circle" style="font-size:48px;"></i>
          <h4 style="margin-top:20px;">Error Loading Brands</h4>
          <p>${error.message}</p>
          <button class="btn btn-primary mt-3" onclick="loadBrands()">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

/**
 * ==========================================
 * SECTION 3: RENDERING FUNCTIONS
 * ==========================================
 */

/**
 * Render Brands List
 */
function renderBrandsList() {
  console.log('🎨 Rendering brands list...');
  
  const container = document.getElementById('brandsListContainer');
  const emptyState = document.getElementById('brandsEmptyState');
  
  if (!container) {
    console.error('❌ brandsListContainer not found!');
    return;
  }
  
  // Check if no brands
  if (!brandsCache || brandsCache.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    console.log('No brands to display');
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Sort brands alphabetically
  const sortedBrands = [...brandsCache].sort((a, b) => a.localeCompare(b));
  
  // Build HTML
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  sortedBrands.forEach(brand => {
    // Create brand card
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                <i class="bi bi-tag"></i> ${escapeHtml(brand)}
              </h5>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger" 
                      onclick="confirmDeleteBrand('${escapeHtml(brand)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Render to page
  container.innerHTML = html;
  console.log(`✅ Rendered ${brandsCache.length} brands`);
}

/**
 * Filter brands based on search input
 */
function filterBrands(searchTerm) {
  if (!brandsCache) {
    console.warn('⚠️ brandsCache is empty');
    return;
  }
  
  const term = searchTerm.toLowerCase().trim();
  const container = document.getElementById('brandsListContainer');
  const emptyState = document.getElementById('brandsEmptyState');
  
  if (!container) return;
  
  // If search is empty, show all brands
  if (!term || term.length === 0) {
    renderBrandsList();
    return;
  }
  
  // Filter brands
  const filtered = brandsCache.filter(brand => 
    brand.toLowerCase().includes(term)
  );
  
  console.log(`🔍 Search: "${searchTerm}" - Found ${filtered.length} matches`);
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Render filtered list
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#999;">
        <i class="bi bi-search" style="font-size:48px;"></i>
        <h4 style="margin-top:20px;">No brands found</h4>
        <p>No brands match "${escapeHtml(searchTerm)}"</p>
        <button class="btn btn-outline-primary mt-3" onclick="document.getElementById('searchBrandsInput').value=''; filterBrands('');">
          <i class="bi bi-x-circle"></i> Clear Search
        </button>
      </div>
    `;
    return;
  }
  
  // Build HTML for filtered brands
  const sortedFiltered = filtered.sort((a, b) => a.localeCompare(b));
  
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  sortedFiltered.forEach(brand => {
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                <i class="bi bi-tag"></i> ${escapeHtml(brand)}
              </h5>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger" 
                      onclick="confirmDeleteBrand('${escapeHtml(brand)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * ==========================================
 * SECTION 4: MODAL FUNCTIONS
 * ==========================================
 */

/**
 * Open Add Brands Modal
 */
function openAddBrandModal() {
  console.log('➕ Opening Add Brands modal');
  
  pendingBrands = [];
  
  // Reset form
  const input = document.getElementById('brandInput');
  if (input) {
    input.value = '';
  }
  
  updateBrandPreviewList();
  
  // Show modal using Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('addBrandsModal'));
  modal.show();
  
  // Focus input
  setTimeout(() => {
    if (input) {
      input.focus();
    }
  }, 100);
}

/**
 * ==========================================
 * SECTION 5: HANDLE BRAND INPUT
 * ==========================================
 */

function handleBrandInputKeydown(event) {
  const input = document.getElementById('brandInput');
  if (!input) {
    console.error('❌ brandInput not found');
    return;
  }
  
  // ✅ Initialize pendingBrands if undefined
  if (typeof pendingBrands === 'undefined') {
    window.pendingBrands = [];
  }
  
  const value = input.value.trim();
  
  console.log('🔑 Key pressed:', event.key, '| Value:', value); // Debug log
  
  // Enter or Comma key
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    
    if (value && value.length > 0) {
      // Remove comma if typed
      const brand = value.replace(/,\s*$/, '').trim();
      
      console.log('🏷️ Adding brand:', brand); // Debug log
      
      // Check if brand is empty after cleaning
      if (!brand || brand.length === 0) {
        console.warn('⚠️ Brand is empty after cleaning');
        return;
      }
      
      // Check for duplicates in pending list
      if (pendingBrands.includes(brand)) {
        alert(`⚠️ "${brand}" is already in the list!`);
        input.value = '';
        return;
      }
      
      // Check if brand already exists in Firebase
      if (brandsCache && brandsCache.includes(brand)) {
        alert(`⚠️ Brand "${brand}" already exists!`);
        input.value = '';
        return;
      }
      
      // Add to pending list
      pendingBrands.push(brand);
      console.log('✅ Brand added to preview:', brand);
      console.log('📋 Current pending brands:', pendingBrands);
      
      // Clear input
      input.value = '';
      
      // Update preview
      updateBrandPreviewList();
    }
  }
}


/**
 * ==========================================
 * SECTION 6: UPDATE BRAND PREVIEW
 * ==========================================
 */

function updateBrandPreviewList() {
  const previewList = document.getElementById('brandPreviewList');
  const previewCount = document.getElementById('previewCount');
  
  if (!previewList) return;
  
  // Update count
  if (previewCount) {
    previewCount.textContent = `📝 Brands to Save (${pendingBrands.length}):`;
  }
  
  if (pendingBrands.length === 0) {
    previewList.innerHTML = `
      <div style="padding: 15px; color: #999; text-align: center; font-size: 14px;">
        No brands added yet
      </div>
    `;
    return;
  }
  
  let html = '';
  pendingBrands.forEach((brand, index) => {
    html += `
      <div style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 10px; border-bottom: 1px solid #e0e0e0;
        background: white; transition: background 0.2s;
      " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
        
        <span style="font-size: 13px; color: #333; flex: 1;">
          <strong style="color: #007bff;">${index + 1}.</strong> 
          <span>${escapeHtml(brand)}</span>
        </span>
        
        <button onclick="removePendingBrand('${escapeHtml(brand)}')" style="
          background: #dc3545; color: white; border: none; 
          padding: 4px 8px; border-radius: 3px; cursor: pointer;
          font-size: 11px; font-weight: bold; transition: background 0.2s;
        " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'"
           title="Remove this brand">
          ✕
        </button>
      </div>
    `;
  });
  
  previewList.innerHTML = html;
}

function removePendingBrand(brand) {
  pendingBrands = pendingBrands.filter(b => b !== brand);
  updateBrandPreviewList();
  console.log('🗑️ Removed from preview:', brand);
}

/**
 * ==========================================
 * SECTION 7: SAVE ALL BRANDS TO FIREBASE
 * ==========================================
 */

async function saveAllBrands() {
  if (pendingBrands.length === 0) {
    alert('⚠️ Please add at least one brand');
    return;
  }
  
  console.log('💾 Saving', pendingBrands.length, 'brands to Firebase...');
  
  const user = window.auth.currentUser;
  
  if (!user) {
    alert('❌ Please sign in first');
    return;
  }
  
  try {
    // Close modal immediately (Optimistic UI)
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBrandsModal'));
    if (modal) {
      modal.hide();
    }
    
    // Add brands to cache immediately (Optimistic UI)
    const brandsToSave = [...pendingBrands];
    brandsCache.push(...brandsToSave);
    
    // Refresh display immediately
    renderBrandsList();
    
    // Show success alert immediately
    alert(`✅ Success!\n\n${brandsToSave.length} brand(s) added!`);
    
    // Clear pending brands
    pendingBrands = [];
    
    // Save to Firebase in background
    const { collection, addDoc, serverTimestamp } = window.firebaseImports;
    const userId = user.uid;
    
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    
    // Save each brand
    const savePromises = brandsToSave.map(async (brandName) => {
      try {
        await addDoc(brandsRef, {
          name: brandName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Firebase: Brand saved:', brandName);
        return { success: true, brand: brandName };
      } catch (error) {
        console.error('❌ Firebase: Failed to save brand:', brandName, error);
        return { success: false, brand: brandName, error };
      }
    });
    
    // Wait for all saves to complete
    const results = await Promise.all(savePromises);
    
    // Check results
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} brand(s) failed to save to Firebase`);
      console.warn('Failed brands:', failed.map(f => f.brand));
      
      // Reload brands from Firebase to sync
      setTimeout(() => {
        loadBrands();
      }, 1000);
    } else {
      console.log(`✅ All ${brandsToSave.length} brands saved to Firebase`);
    }
    
    // Refresh brand autocomplete cache
    if (typeof refreshBrandAutocompleteCache === 'function') {
      refreshBrandAutocompleteCache();
    }
    
  } catch (error) {
    console.error('❌ Error saving brands:', error);
    alert('❌ Error saving brands. Please try again.');
    
    // Reload brands to sync with Firebase
    loadBrands();
  }
}

/**
 * ==========================================
 * SECTION 8: DELETE BRAND FROM FIREBASE
 * ==========================================
 */

/**
 * Confirm delete brand
 */
function confirmDeleteBrand(brand) {
  const confirmed = confirm(`🗑️ Delete "${brand}"?\n\nThis cannot be undone.`);
  
  if (confirmed) {
    deleteBrand(brand);
  }
}

/**
 * Delete brand with Optimistic UI
 */
async function deleteBrand(brandName) {
  console.log('🗑️ Deleting brand:', brandName);
  
  const user = window.auth.currentUser;
  
  if (!user) {
    alert('❌ Please sign in first');
    return;
  }
  
  try {
    // Remove from cache immediately (Optimistic UI)
    brandsCache = brandsCache.filter(b => b !== brandName);
    
    // Refresh display immediately
    renderBrandsList();
    
    // Show success alert immediately
    alert(`✅ Brand "${brandName}" deleted successfully!`);
    
    // Delete from Firebase in background
    const { collection, query, where, getDocs, deleteDoc } = window.firebaseImports;
    const userId = user.uid;
    
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    const q = query(brandsRef, where('name', '==', brandName));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn('⚠️ Brand not found in Firebase:', brandName);
      return;
    }
    
    // Delete all matching documents (should be only one)
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Firebase: Brand deleted:', brandName);
    
    // Update autocomplete cache in product form
    if (typeof refreshBrandAutocompleteCache === 'function') {
      refreshBrandAutocompleteCache();
    }
    
  } catch (error) {
    console.error('❌ Firebase: Error deleting brand:', error);
    
    // If error, restore to cache
    brandsCache.push(brandName);
    renderBrandsList();
    
    // Show error
    alert('⚠️ Error deleting from Firebase. Refreshing list...');
    
    // Reload brands to sync
    loadBrands();
  }
}

/**
 * ==========================================
 * SECTION 9: HELPER FUNCTIONS
 * ==========================================
 */

function goBackHome() {
  console.log('🏠 Going back to home');
  
  // Show navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.display = 'flex';
  }
  
  // Hide brands page
  const brandsPage = document.getElementById('brandsPage');
  if (brandsPage) {
    brandsPage.style.display = 'none';
  }
  
  // Call navigate to home
  if (typeof navigateToHome === 'function') {
    navigateToHome();
  } else if (typeof navigateTo === 'function') {
    navigateTo('dashboard');
  } else {
    // Fallback: reload page
    location.reload();
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

console.log('✅ Brand Manager Module Loaded (Firebase)');

/**
 * Test function - Remove after debugging
 */
function testBrandInput() {
  console.log('=== BRAND INPUT TEST ===');
  console.log('pendingBrands:', typeof pendingBrands, pendingBrands);
  console.log('brandsCache:', typeof brandsCache, brandsCache);
  console.log('========================');
  
  // Test adding a brand
  if (typeof pendingBrands !== 'undefined') {
    pendingBrands.push('Test Brand');
    updateBrandPreviewList();
    console.log('✅ Test brand added successfully');
  } else {
    console.error('❌ pendingBrands is undefined!');
  }
}

// Call it from console: testBrandInput()
window.testBrandInput = testBrandInput;
