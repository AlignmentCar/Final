/**
 * ==========================================
 * BRANDS MANAGEMENT MODULE
 * File: brand-manager.js
 * ==========================================
 */

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
  
  // === STEP 5: Load brands from backend ===
  if (typeof loadBrands === 'function') {
    loadBrands();
    console.log('✅ Brands data loaded');
  } else {
    console.warn('⚠️ loadBrands function not found');
  }
  
  // === STEP 6: Close sidebar and scroll ===
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

// Load Brands from Backend
async function loadBrands() {
  try {
    console.log('📡 Fetching brands from server...');
    
    // Fetch data (no auth needed - bypassed in doPost)
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getBrands' })
    });
    
    const data = await response.json();
    
    // Check response
    if (data.success && data.brands) {
      brandsCache = data.brands;
      console.log('✅ Loaded', data.brands.length, 'brands');
      
      // ✅ RENDER IMMEDIATELY - Don't wait for anything
      renderBrandsList();
    } else {
      throw new Error(data.error || 'Failed to load brands');
    }
    
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

// Render Brands List
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
  
  // Build HTML
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  brandsCache.forEach(brand => {
    // Create brand card
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                🏷️ ${escapeHtml(brand)}
              </h5>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger" 
                      onclick="confirmDeleteBrand('${escapeHtml(brand)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i>
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
 * ==========================================
 * SECTION 4: MODAL FUNCTIONS
 * ==========================================
 */

// Open Add Brands Modal
function openAddBrandModal() {
  console.log('➕ Opening Add Brands modal');
  
  pendingBrands = [];
  
  // Reset form
  document.getElementById('brandInput').value = '';
  updateBrandPreviewList();
  
  // Show modal using Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('addBrandsModal'));
  modal.show();
  
  // Focus input
  setTimeout(() => {
    document.getElementById('brandInput').focus();
  }, 100);
}

/**
 * ==========================================
 * SECTION 5: HANDLE BRAND INPUT
 * ==========================================
 */

function handleBrandInputKeydown(event) {
  const input = document.getElementById('brandInput');
  const value = input.value.trim();
  
  // Enter or Comma key
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    
    if (value && value.length > 0) {
      // Remove comma if typed
      const brand = value.replace(/,\s*$/, '').trim();
      
      // Add only if not duplicate
      if (brand && !pendingBrands.includes(brand)) {
        pendingBrands.push(brand);
        console.log('✅ Brand added to preview:', brand);
      }
      
      // Clear input
      input.value = '';
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
        " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
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
 * SECTION 7: SAVE ALL BRANDS
 * ==========================================
 */

/**
 * ==========================================
 * SECTION 7: SAVE ALL BRANDS (SEQUENTIAL)
 * ==========================================
 */

function saveAllBrands() {
  if (pendingBrands.length === 0) {
    alert('⚠️ Please add at least one brand');
    return;
  }
  
  console.log('💾 Saving', pendingBrands.length, 'brands...');
  
  // ✅ CLOSE MODAL IMMEDIATELY (Optimistic UI)
  const modal = bootstrap.Modal.getInstance(document.getElementById('addBrandsModal'));
  if (modal) {
    modal.hide();
  }
  
  // ✅ ADD BRANDS TO CACHE IMMEDIATELY (Optimistic UI)
  const brandsToSave = [...pendingBrands];
  brandsCache.push(...brandsToSave);
  
  // ✅ REFRESH DISPLAY IMMEDIATELY
  renderBrandsList();
  
  // ✅ SHOW SUCCESS ALERT IMMEDIATELY
  alert(`✅ Success!\n\n${brandsToSave.length} brand(s) added!`);
  
  // ✅ CLEAR PENDING BRANDS
  pendingBrands = [];
  
  // ✅ SAVE SEQUENTIALLY IN BACKGROUND (one after another)
  saveBrandsSequentially(brandsToSave, 0, [], []);
}

/**
 * Save brands one by one sequentially
 * This prevents concurrent request issues
 */
function saveBrandsSequentially(brands, index, savedBrands, failedBrands) {
  // Base case: All done
  if (index >= brands.length) {
    handleBackendResults(savedBrands.length, failedBrands.length, failedBrands);
    return;
  }
  
  const brand = brands[index];
  console.log(`💾 Saving brand ${index + 1}/${brands.length}:`, brand);
  
  // Save this brand
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ 
      action: 'addBrand',
      brandName: brand
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      savedBrands.push(brand);
      console.log(`✅ Backend saved (${index + 1}/${brands.length}):`, brand);
    } else {
      failedBrands.push(brand);
      console.warn(`⚠️ Backend failed (${index + 1}/${brands.length}):`, brand, data.error);
    }
    
    // ✅ Save next brand (sequential)
    saveBrandsSequentially(brands, index + 1, savedBrands, failedBrands);
  })
  .catch(error => {
    failedBrands.push(brand);
    console.error(`❌ Backend error (${index + 1}/${brands.length}):`, brand, error);
    
    // ✅ Continue to next brand even if this one failed
    saveBrandsSequentially(brands, index + 1, savedBrands, failedBrands);
  });
}

/**
 * Handle backend results (silent, no alert)
 */
function handleBackendResults(saved, failed, failedBrands) {
  if (failed > 0) {
    console.warn(`⚠️ Backend: ${saved} saved, ${failed} failed`);
    console.warn('Failed brands:', failedBrands);
    
    // ✅ Optional: Reload brands from server to sync
    setTimeout(() => {
      loadBrands();
    }, 1000);
  } else {
    console.log(`✅ All ${saved} brands saved to backend`);
  }
}

/**
 * Handle backend results (silent, no alert)
 */
function handleBackendResults(saved, failed, failedBrands) {
  if (failed > 0) {
    console.warn(`⚠️ Backend: ${saved} saved, ${failed} failed`);
    console.warn('Failed brands:', failedBrands);
  } else {
    console.log(`✅ All ${saved} brands saved to backend`);
  }
}

/**
 * ==========================================
 * SECTION 8: DELETE BRAND (OPTIMISTIC UI)
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
 * Removes from UI immediately, deletes from backend in background
 */
function deleteBrand(brand) {
  console.log('🗑️ Deleting brand:', brand);
  
  // ✅ REMOVE FROM CACHE IMMEDIATELY (Optimistic UI)
  brandsCache = brandsCache.filter(b => b !== brand);
  
  // ✅ REFRESH DISPLAY IMMEDIATELY
  renderBrandsList();
  
  // ✅ SHOW SUCCESS ALERT IMMEDIATELY
  alert(`✅ Brand "${brand}" deleted successfully!`);
  
  // ✅ DELETE FROM BACKEND IN BACKGROUND (async)
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ 
      action: 'deleteBrand',
      brandName: brand
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Backend: Brand deleted:', brand);
      
      // ✅ Update autocomplete cache in product form
      if (typeof refreshBrandAutocompleteCache === 'function') {
        refreshBrandAutocompleteCache();
      }
    } else {
      console.warn('⚠️ Backend delete failed:', data.error);
      
      // If backend fails, restore to cache
      brandsCache.push(brand);
      renderBrandsList();
      
      // Show error
      alert('⚠️ Note: Backend deletion may have failed. Refreshing list...');
    }
  })
  .catch(error => {
    console.error('❌ Backend error deleting brand:', error);
    
    // If error, restore to cache
    brandsCache.push(brand);
    renderBrandsList();
    
    // Show error
    alert('⚠️ Note: Error deleting from backend. Refreshing list...');
  });
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
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

console.log('✅ Brand Manager Module Loaded');





