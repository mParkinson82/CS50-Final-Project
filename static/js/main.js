// Calculator Module
const Calculator = {
    // State
    currentAmount: '0',
    hasDecimal: false,
    isChecking: false, // Track if we're showing results
    
    // DOM Elements (initialized in init())
    elements: {
        buttons: null,
        display: null,
        resultImage: null,
        successImage: null,
        failureImage: null,
        successText: null,
        failureText: null,
        welcomeMessage: null,
        questionButton: null,
        confirmButton: null
    },
    
    // User's balance (initialized in init())
    userBalance: 0,
    
    // Initialize the calculator
    init() {
        // Cache DOM elements
        this.elements.buttons = document.querySelectorAll('.btn');
        this.elements.display = document.getElementById('display');
        this.elements.resultImage = document.querySelector('.result-image');
        this.elements.successImage = document.querySelector('.success-image');
        this.elements.failureImage = document.querySelector('.failure-image');
        this.elements.successText = document.querySelector('.success-text');
        this.elements.confirmButton = document.querySelector('.confirm-purchase');
        this.elements.confirmButton.addEventListener('click', () => this.handlePurchase());
        this.elements.failureText = document.querySelector('.failure-text');
        this.elements.welcomeMessage = document.querySelector('.welcome-message');
        this.elements.questionButton = Array.from(this.elements.buttons)
            .find(btn => btn.textContent === '?');
        
        // Get user's balance
        const balanceElement = document.querySelector('.balance');
        this.userBalance = parseFloat(balanceElement.textContent.replace('$', ''));
        
        // Bind event listeners
        this.bindEvents();
    },
    
    bindEvents() {
        // Button clicks
        const numberPad = document.querySelector('.number-pad');
        if (numberPad) {
            numberPad.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn')) {
                    this.handleButtonClick(e.target.textContent);
                }
            });
        }
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            const displayElement = document.getElementById('display');
            const addFundsPopup = document.querySelector('.funds-popup');
            
            // Ignore keyboard input if add funds popup is visible
            if (addFundsPopup && addFundsPopup.style.display === 'block') {
                return;
            }

            // Only handle calculator keys when not typing in other inputs
            if (!e.target.matches('input')) {
                this.handleKeyPress(e);
            }
        });
    },
    
    handleButtonClick(value) {
        if (value === '?' || value === '↻') {
            if (this.isChecking) {
                this.resetCalculator();
            } else {
                this.checkAmount();
            }
        } else if (value === '.') {
            if (!this.hasDecimal) {
                this.currentAmount += '.';
                this.hasDecimal = true;
            }
        } else {
            // Only handle number inputs if not showing results
            if (!this.isChecking) {
                if (this.currentAmount === '0') {
                    this.currentAmount = value;
                } else {
                    // Limit to 2 decimal places
                    if (this.hasDecimal) {
                        const [whole, decimal] = this.currentAmount.split('.');
                        if (!decimal || decimal.length < 2) {
                            this.currentAmount += value;
                        }
                    } else {
                        this.currentAmount += value;
                    }
                }
                this.updateDisplay();
            }
        }
    },
    
    handleKeyPress(e) {
        const key = e.key;
        if ((key >= '0' && key <= '9') || key === '.') {
            if (!this.isChecking) {
                const button = Array.from(this.elements.buttons)
                    .find(btn => btn.textContent === key);
                if (button) this.handleButtonClick(key);
            }
        } else if (key === 'Enter') {
            if (this.isChecking) {
                this.resetCalculator();
            } else {
                this.checkAmount();
            }
        }
    },
    
    updateDisplay() {
        this.elements.display.textContent = `$${this.currentAmount}`;
    },
    
    checkAmount() {
        const amount = parseFloat(this.currentAmount);
        
        // Hide message
            this.elements.welcomeMessage.style.display = 'none';

        // Get the current balance from the DOM in case it was updated
        const balanceElement = document.querySelector('.balance');
        this.userBalance = parseFloat(balanceElement.textContent.replace('$', ''));
        
        // Show result container
        this.elements.resultImage.style.display = 'flex';
        this.elements.resultImage.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.resultImage.style.transition = 'opacity 0.3s ease-in';
            this.elements.resultImage.style.opacity = '1';
        
        if (amount <= this.userBalance) {
            this.elements.successImage.style.display = 'block';
            this.elements.failureImage.style.display = 'none';
            this.elements.successText.style.display = 'flex';
            this.elements.failureText.style.display = 'none';
            this.elements.confirmButton.style.display = 'block';
        } else {
            this.elements.successImage.style.display = 'none';
            this.elements.failureImage.style.display = 'block';
            this.elements.successText.style.display = 'none';
            this.elements.failureText.style.display = 'flex';
            this.elements.confirmButton.style.display = 'none';
        }
    }, 50);
        
        // Change ? to ↻
        this.elements.questionButton.textContent = '↻';
        this.isChecking = true;
},

    handlePurchase() {
        // Convert current amount to number and subtract from balance

        const purchaseAmount = parseFloat(this.currentAmount);
        fetch('/purchase', {  // New endpoint for purchases
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `amount=${purchaseAmount}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Purchase failed');
            }
            return response.text();
        })
        .then(newBalance => {
        
        // Update the balance display in the DOM
        const balanceElement = document.querySelector('.balance');
        balanceElement.textContent = `$${parseFloat(newBalance).toFixed(2)}`;

        // Update Calculator's reference to userBalance
        this.userBalance = parseFloat(newBalance);
        
        // Reset the calculator
        this.resetCalculator();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Purchase failed. Please try again.');
    });

},
    
    resetCalculator() {
        // Reset state
        this.currentAmount = '0';
        this.hasDecimal = false;
        this.isChecking = false;
        
        // Update display
        this.updateDisplay();
        
        //Immediately hide results
        this.elements.resultImage.style.display = 'none';
        this.elements.successImage.style.display = 'none';
        this.elements.failureImage.style.display = 'none';
        this.elements.successText.style.display = 'none';
        this.elements.failureText.style.display = 'none';
        this.elements.confirmButton.style.display = 'none';
        
        // Show welcome message with fade in effect
        this.elements.welcomeMessage.style.display = 'flex';
        this.elements.welcomeMessage.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.welcomeMessage.style.transition = 'opacity 0.3s ease-in';
            this.elements.welcomeMessage.style.opacity = '1';
        }, 50);
        
        // Change ↻ back to ?
        this.elements.questionButton.textContent = '?';
    }
};

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Calculator.init();
});

// Add Funds Module
const AddFundsModule = {
    // DOM Elements
    elements: {
        addFundsButton: null,
        popup: null,
        closeButton: null,
        form: null
    },

    init() {
        // Create popup elements
        this.createPopupElements();
        
        // Cache DOM elements
        this.elements.addFundsButton = document.querySelector('.add-funds-button');
        
        // Bind events
        this.bindEvents();
    },

    createPopupElements() {
        // Create popup container
        this.elements.popup = document.createElement('div');
        this.elements.popup.className = 'funds-popup';
        this.elements.popup.style.cssText = `
            display: none;
            position: absolute;
            top: 60px;
            right: 120px;
            background: #FFF4EA;
            padding: 20px;
            border: 2px solid #000;
            border-radius: 10px;
            z-index: 1000;
            width: 300px;
            box-shadow: 0 6px 0 #262626, 0 8px 10px rgba(26,26,26,0.2);
        `;

        // Create popup content
        const content = `
            <div class="popup-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-family: 'Sue Ellen Francisco', cursive; font-size: 24px; margin: 0;">Add Funds</h3>
                <button class="close-popup" style="background: none; border: none; cursor: pointer; font-size: 20px;">×</button>
            </div>
            <form id="add-funds-form" method="POST" action="/add-funds">
                <div style="margin-bottom: 15px;">
                    <input type="number" 
                           name="amount"
                           step="0.01" 
                           min="0.01" 
                           placeholder="Enter amount" 
                           required
                           style="width: 100%; 
                                  padding: 8px; 
                                  border: 2px solid #000; 
                                  border-radius: 5px;
                                  font-family: 'Sue Ellen Francisco', cursive;
                                  font-size: 18px;">
                </div>
                <button type="submit" 
                        style="width: 100%;
                               background: rgb(75, 156, 75);
                               color: white;
                               padding: 10px;
                               border: 2px solid #000;
                               border-radius: 10px;
                               cursor: pointer;
                               font-family: 'Sue Ellen Francisco', cursive;
                               font-size: 20px;
                               box-shadow: 0 4px 0 #262626, 0 6px 8px rgba(26,26,26,0.2);">
                    Add Funds
                </button>
            </form>
        `;
        this.elements.popup.innerHTML = content;
        
        // Add popup to document
        document.body.appendChild(this.elements.popup);
        
        // Cache additional elements
        this.elements.closeButton = this.elements.popup.querySelector('.close-popup');
        this.elements.form = this.elements.popup.querySelector('#add-funds-form');
    },

    bindEvents() {
        // Toggle popup
        this.elements.addFundsButton.addEventListener('click', () => this.togglePopup());
        
        // Close popup
        this.elements.closeButton.addEventListener('click', () => this.hidePopup());
        
        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.popup.contains(e.target) && 
                e.target !== this.elements.addFundsButton) {
                this.hidePopup();
            }
        });
        
        // Handle form submission
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    togglePopup() {
        const isDisplayed = this.elements.popup.style.display === 'block';
        this.elements.popup.style.display = isDisplayed ? 'none' : 'block';

        if (!isDisplayed) {
            // Clear input field when popup opens
            this.elements.form.reset();
        }
    },

    hidePopup() {
        this.elements.popup.style.display = 'none';
        this.elements.form.reset();
    },

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const amount = formData.get('amount');

        if (!amount || parseFloat(amount) <= 0) {
            return;  // Don't submit if amount is invalid
        }
        
        fetch('/add-funds', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add funds');
            }
            return response.text();
        })

        .then(newBalance => {
            const balanceElement = document.querySelector('.balance');
            const newBalanceFormatted = `$${parseFloat(newBalance).toFixed(2)}`;

            const balances = document.querySelectorAll('.balance');
            for (const element of balances) {
                element.textContent = newBalanceFormatted;
            }
                
            // Update Calculator's reference to userBalance
            if (Calculator && Calculator.userBalance !== undefined) {
                Calculator.userBalance = parseFloat(newBalance);
            }
            
            // Reset form and close popup
            form.reset();
            this.hidePopup();
        })
        .catch(error => {
            console.error('Error:', error);
            // Only show alert if it's not just an empty form submission
            if (amount && parseFloat(amount) > 0) {
                alert('Failed to add funds. Please try again.');
            }
        });
    }
};


document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.logout-button');
    const logoutModal = document.querySelector('.logout-modal');
    const logoutForm = document.querySelector('form[action*="logout"]');
    
    if (logoutButton && logoutModal && logoutForm) {
        // Show modal when logout button is clicked
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logoutModal.style.display = 'flex';
        });
        
        // Handle modal button clicks
        logoutModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('cancel')) {
                logoutModal.style.display = 'none';
            } else if (e.target.classList.contains('confirm')) {
                // Submit the logout form
                logoutForm.submit();
            } else if (e.target === logoutModal) {
                // Close if clicking outside the modal
                logoutModal.style.display = 'none';
            }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && logoutModal.style.display === 'flex') {
                logoutModal.style.display = 'none';
            }
        });
    }
});

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AddFundsModule.init();
});