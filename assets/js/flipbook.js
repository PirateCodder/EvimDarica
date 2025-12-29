/**
 * EvimDarıca Catalog FlipBook
 * Custom flipbook implementation with St.PageFlip
 */

$(document).ready(function() {
    // Remove loading screen faster for catalog page
    if ($("body").hasClass("has-loading-screen")) {
        Pace.on("done", function() {
            $(".page-wrapper").addClass("loading-done");
            setTimeout(function() {
                $(".page-wrapper").addClass("hide-loading-screen");
            }, 300);
        });
    }
    
    // Make sure background navigation shows immediately
    $(".navigation").addClass("show-background");
    
    // Force navigation visibility on all devices with JavaScript
    function forceNavVisibility() {
        $('.catalog-nav .navigation-links').css({
            'display': 'flex !important',
            'position': 'static !important',
            'background': 'transparent !important',
            'box-shadow': 'none !important',
            'visibility': 'visible !important',
            'opacity': '1 !important',
            'transform': 'none !important'
        }).show();
        
        $('.catalog-nav .right').css({
            'display': 'flex !important'
        }).show();
        
        $('.catalog-nav .nav').css({
            'display': 'flex !important'
        }).show();
        
        $('.catalog-nav li').css({
            'display': 'block !important'
        }).show();
        
        $('.catalog-nav .back-button').css({
            'display': 'inline-flex !important'
        }).show();
    }
    
    // Apply on page load
    forceNavVisibility();
    
    // Apply on window resize
    $(window).resize(function() {
        forceNavVisibility();
    });
    
    // Parallax effect for catalog hero background
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var rate = scrolled * -0.5;
        $('.catalog-hero').css('background-position', 'center ' + rate + 'px');
    });
    
    // Initialize St.PageFlip
    let pageFlip;
    let audio;
    let audioUnlocked = false;
    let currentPage = 0;
    let totalPages = 5; // Default for desktop (5 çift)
    let isMobile = false;
    
    // Setup audio
    if (typeof Audio !== 'undefined') {
        audio = new Audio('media/paper.wav');
        audio.preload = 'auto';
        audio.volume = 0.5;
        
        // Unlock audio on first user interaction
        const unlockAudio = () => {
            if (!audioUnlocked) {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audioUnlocked = true;
                }).catch(() => {
                    // Audio unlock failed
                });
            }
        };
        
        $(document).one('click touchstart', unlockAudio);
    }
    
    // Mobile detection function
    function checkMobileMode() {
        isMobile = window.innerWidth <= 768;
        totalPages = isMobile ? 10 : 5; // Mobile: 10 tek sayfa, Desktop: 5 çift sayfa
        return isMobile;
    }
    
    // Initial mobile check
    checkMobileMode();
    
    // Update on window resize
    $(window).resize(function() {
        const wasMobile = isMobile;
        checkMobileMode();
        
        // Reinitialize if mobile state changed
        if (wasMobile !== isMobile && pageFlip) {
            initializeFlipbook();
        }
    });
    
    // Initialize flipbook function
    function initializeFlipbook() {
        const flipbookElement = document.getElementById('flipbook');
        if (flipbookElement && typeof St !== 'undefined') {
            // Destroy existing instance if exists
            if (pageFlip && pageFlip.destroy) {
                pageFlip.destroy();
            }
            
            pageFlip = new St.PageFlip(flipbookElement, {
                width: isMobile ? 960 : 960,
                height: isMobile ? 540 : 540,
                size: "stretch",
                minWidth: isMobile ? 320 : 480,
                maxWidth: isMobile ? 2000 : 1920,
                minHeight: isMobile ? 180 : 270,
                maxHeight: isMobile ? 1200 : 1080,
                maxShadowOpacity: 0.6,
                showCover: false,
                mobileScrollSupport: false,
                swipeDistance: 30,
                clickEventForward: true,
                usePortrait: isMobile, // Mobile: tek sayfa, Desktop: çift sayfa
                startZIndex: 0,
                autoSize: false,
                showPageCorners: true,
                disableFlipByClick: false,
                flippingTime: 1000
            });
            
            pageFlip.loadFromHTML(document.querySelectorAll('.page'));
            
            // Update page info function
            function updatePageInfo() {
                currentPage = pageFlip.getCurrentPageIndex();
                let displayPage, maxPage;
                
                if (isMobile) {
                    // Mobile: tek sayfa gösterimi (1/10, 2/10, ...)
                    displayPage = currentPage + 1;
                    maxPage = totalPages;
                } else {
                    // Desktop: çift sayfa gösterimi (1/5, 2/5, ...)
                    displayPage = Math.floor(currentPage / 2) + 1;
                    maxPage = totalPages;
                }
                
                const pageInfo = displayPage + ' / ' + maxPage;
                $('#flipbook-page-info').text(pageInfo);
                
                // Update navigation buttons
                $('#flipbook-prev').prop('disabled', currentPage === 0);
                if (isMobile) {
                    $('#flipbook-next').prop('disabled', currentPage >= (totalPages - 1));
                } else {
                    $('#flipbook-next').prop('disabled', currentPage >= (totalPages * 2 - 2));
                }
            }
            
            // Play sound and update page info on page flip
            pageFlip.on('flip', function(e) {
                if (audio && audioUnlocked) {
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.log('Audio play failed:', e.message);
                    });
                }
                updatePageInfo();
            });
            
            // Handle change event for page updates
            pageFlip.on('changeState', function(e) {
                updatePageInfo();
            });
            
            // Navigation button event handlers
            $('#flipbook-prev').on('click', function() {
                if (pageFlip) {
                    pageFlip.flipPrev();
                }
            });
            
            $('#flipbook-next').on('click', function() {
                if (pageFlip) {
                    pageFlip.flipNext();
                }
            });
            
            // Initial page info update
            setTimeout(function() {
                updatePageInfo();
            }, 100);
            
            // Keyboard controls
            $(document).on('keydown', function(e) {
                if (pageFlip) {
                    if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
                        e.preventDefault();
                        pageFlip.flipPrev();
                    } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
                        e.preventDefault();
                        pageFlip.flipNext();
                    }
                }
            });
            
            // Touch swipe for mobile
            let startX = 0;
            let startY = 0;
            
            $(document).on('touchstart', function(e) {
                startX = e.originalEvent.touches[0].clientX;
                startY = e.originalEvent.touches[0].clientY;
            });
            
            $(document).on('touchend', function(e) {
                if (!startX || !startY || !pageFlip) return;
                
                let endX = e.originalEvent.changedTouches[0].clientX;
                let endY = e.originalEvent.changedTouches[0].clientY;
                
                let diffX = startX - endX;
                let diffY = startY - endY;
                
                // Only handle horizontal swipes
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        pageFlip.flipNext();
                    } else {
                        pageFlip.flipPrev();
                    }
                }
                
                startX = 0;
                startY = 0;
            });
        }
    }
    
    // Initialize flipbook after a short delay
    setTimeout(function() {
        initializeFlipbook();
    }, 500);
});
