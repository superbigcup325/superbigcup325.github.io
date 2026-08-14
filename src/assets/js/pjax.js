/* =========================================================
   pjax.js - PJAX 路由 + 主题切换 + 阅读进度 + TOC 高亮
   + reveal 动画 + Canvas 粒子 + 3D 卡片倾斜 + 鼠标光晕
   ========================================================= */

;(function () {
  'use strict'

  var PJAX_CONTAINER_ID = 'pjax-container'
  var SIDEBAR_ID = 'sidebar'
  var TOC_ID = 'toc'
  var NAV_TOGGLE_ID = 'nav-toggle'
  var PROGRESS_ID = 'reading-progress'
  var BACK_TOP_ID = 'back-to-top'
  var BACK_TOP_RING_ID = 'back-to-top-ring'
  var CURSOR_GLOW_ID = 'cursor-glow'
  var HERO_CANVAS_ID = 'hero-canvas'
  var THEME_KEY = 'blog-theme'
  var CIRCUMFERENCE = 125.6

  var mainElement = document.getElementById(PJAX_CONTAINER_ID)
  var progressBar = document.getElementById(PROGRESS_ID)
  var backTopBtn = document.getElementById(BACK_TOP_ID)
  var backTopRing = document.getElementById(BACK_TOP_RING_ID)
  var cursorGlow = document.getElementById(CURSOR_GLOW_ID)
  var tocObserver = null
  var revealObserver = null
  var heroCanvas = null
  var heroCleanup = null
  var rafPending = false

  /* ---------- 主题切换 ---------- */
  function getPreferredTheme() {
    var saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    var btn = document.getElementById('theme-toggle')
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙'
  }

  function initTheme() {
    var btn = document.getElementById('theme-toggle')
    if (btn) btn.hidden = false

    applyTheme(getPreferredTheme())

    document.addEventListener('click', function (event) {
      var toggle = event.target.closest ? event.target.closest('#theme-toggle') : null
      if (!toggle) return

      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      applyTheme(next)
    })
  }

  /* ---------- PJAX 工具 ---------- */
  function isInternalLink(link) {
    if (!link || link.target === '_blank') return false
    if (link.hasAttribute('data-no-pjax')) return false
    if (link.origin !== window.location.origin) return false

    var href = link.getAttribute('href') || ''
    if (!href || href.charAt(0) === '#') return false
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false

    return true
  }

  function closeDrawer() {
    var toggle = document.getElementById(NAV_TOGGLE_ID)
    if (toggle) toggle.checked = false
  }

  function scrollAfterSwitch(url) {
    var hash = new URL(url, window.location.origin).hash

    if (hash) {
      var target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    window.scrollTo(0, 0)
  }

  function updateMain(nextDoc) {
    var nextMain = nextDoc.getElementById(PJAX_CONTAINER_ID)
    var currentMain = document.getElementById(PJAX_CONTAINER_ID)

    if (!nextMain || !currentMain) return

    currentMain.innerHTML = nextMain.innerHTML
    currentMain.classList.add('is-switching')
    setTimeout(function () { currentMain.classList.remove('is-switching') }, 380)
    mainElement = currentMain
  }

  function updateSidebar(nextDoc) {
    var nextSidebar = nextDoc.getElementById(SIDEBAR_ID)
    var currentSidebar = document.getElementById(SIDEBAR_ID)

    if (!nextSidebar || !currentSidebar) return

    currentSidebar.innerHTML = nextSidebar.innerHTML
  }

  function updateToc(nextDoc) {
    var nextToc = nextDoc.getElementById(TOC_ID)
    var currentToc = document.getElementById(TOC_ID)

    if (!currentToc) return

    if (!nextToc) {
      currentToc.classList.add('toc--empty')
      return
    }

    currentToc.className = nextToc.className
    currentToc.innerHTML = nextToc.innerHTML
  }

  function updateActiveLink(url) {
    var pathname = new URL(url, window.location.origin).pathname

    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      var linkPathname = new URL(link.href, window.location.origin).pathname
      var isActive = linkPathname === pathname

      if (link.classList.contains('sidebar-nav__link')) {
        link.classList.toggle('sidebar-nav__link--active', isActive)
      }

      if (link.classList.contains('sidebar-chapter__link')) {
        link.classList.toggle('sidebar-chapter__link--active', isActive)
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
    })
  }

  function scrollCurrentChapterIntoView() {
    var activeLink = document.querySelector('.sidebar-chapter__link--active')
    if (!activeLink) return

    var rect = activeLink.getBoundingClientRect()
    var sidebar = document.getElementById(SIDEBAR_ID)

    if (!sidebar) return

    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }

  function loadPage(url, shouldPush) {
    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('请求失败：' + response.status)
        return response.text()
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html')

        updateMain(doc)
        updateSidebar(doc)
        updateToc(doc)
        updateActiveLink(url)
        document.title = doc.title
        document.body.className = doc.body.className

        if (shouldPush) {
          window.history.pushState({ pjax: true }, '', url)
        }

        closeDrawer()
        scrollAfterSwitch(url)
        initPageEnhancements()
      })
      .catch(function (err) {
        console.error('Pjax 切换失败：', err)
        window.location.href = url
      })
  }

  /* ---------- 阅读进度 / 回到顶部 ---------- */
  function updateProgress() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    var progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0

    if (progressBar) progressBar.style.transform = 'scaleX(' + progress + ')'

    if (backTopBtn) {
      if (scrollTop > 360) {
        backTopBtn.hidden = false
      } else {
        backTopBtn.hidden = true
      }
    }

    if (backTopRing) {
      backTopRing.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress))
    }
  }

  /* ---------- 回到顶部 ---------- */
  function initBackToTop() {
    if (!backTopBtn) return

    backTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  /* ---------- 鼠标跟随光晕 ---------- */
  function initCursorGlow() {
    if (!cursorGlow) return
    if (window.matchMedia('(max-width: 880px)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    var moved = false

    document.addEventListener('mousemove', function (event) {
      if (!moved) {
        cursorGlow.style.opacity = '1'
        moved = true
      }

      cursorGlow.style.left = event.clientX + 'px'
      cursorGlow.style.top = event.clientY + 'px'
    })

    document.addEventListener('mouseleave', function () {
      cursorGlow.style.opacity = '0'
      moved = false
    })
  }

  /* ---------- 3D 卡片倾斜 ---------- */
  function initTiltCards() {
    if (window.matchMedia('(max-width: 880px)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    var cards = document.querySelectorAll('.tilt-card')

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect()
        var x = (event.clientX - rect.left) / rect.width
        var y = (event.clientY - rect.top) / rect.height

        card.style.transform = 'perspective(720px) rotateY(' + ((x - 0.5) * 5).toFixed(2) + 'deg) rotateX(' + ((0.5 - y) * 4).toFixed(2) + 'deg) translateY(-4px)'
      })

      card.addEventListener('mouseleave', function () {
        card.style.transform = ''
      })
    })
  }

  /* ---------- Prism 高亮 + 行号 + 复制按钮 ---------- */
  function enhanceCodeBlocks(container) {
    if (!container) return

    if (window.Prism) {
      try {
        window.Prism.highlightAllUnder(container)
      } catch (err) {
        console.warn('Prism 高亮失败：', err)
      }
    }

    container.querySelectorAll('pre').forEach(function (pre) {
      if (pre.hasAttribute('data-code-enhanced')) return

      var code = pre.querySelector('code')
      var lang = 'text'

      if (code) {
        var match = (code.className || '').match(/language-([\w-]+)/)
        if (match) lang = match[1]
      }

      var wrapper = document.createElement('div')
      wrapper.className = 'code-block'

      var top = document.createElement('div')
      top.className = 'code-block__top'

      var langLabel = document.createElement('span')
      langLabel.className = 'code-block__lang'
      langLabel.textContent = lang

      var copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'code-block__copy'
      copyBtn.textContent = '复制'
      copyBtn.setAttribute('data-copy', '')

      top.appendChild(langLabel)
      top.appendChild(copyBtn)

      var body = document.createElement('div')
      body.className = 'code-block__body'

      var gutter = document.createElement('div')
      gutter.className = 'code-block__gutter'
      gutter.setAttribute('aria-hidden', 'true')

      var source = code ? code.textContent : pre.textContent
      var lineCount = source.replace(/\n$/, '').split('\n').length

      for (var i = 1; i <= lineCount; i += 1) {
        var lineNum = document.createElement('span')
        lineNum.textContent = i
        gutter.appendChild(lineNum)
      }

      pre.parentNode.insertBefore(wrapper, pre)
      wrapper.appendChild(top)
      body.appendChild(gutter)
      body.appendChild(pre)
      wrapper.appendChild(body)

      pre.setAttribute('data-code-enhanced', '1')
      pre.classList.add('code-block__pre')
    })
  }

  /* ---------- IntersectionObserver：TOC 高亮 ---------- */
  function initTocHighlight() {
    if (tocObserver) tocObserver.disconnect()

    var headings = document.querySelectorAll('#' + PJAX_CONTAINER_ID + ' h2[id], #' + PJAX_CONTAINER_ID + ' h3[id]')
    var tocLinks = document.querySelectorAll('.toc__link')

    if (!headings.length || !tocLinks.length) return

    tocObserver = new IntersectionObserver(function (entries) {
      var visibleId = null

      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleId = entry.target.id
      })

      if (!visibleId) {
        // 取当前位于视口上方最近的一个标题
        var current = null
        for (var i = headings.length - 1; i >= 0; i -= 1) {
          if (headings[i].getBoundingClientRect().top <= 120) {
            current = headings[i]
            break
          }
        }

        if (!current) current = headings[0]
        visibleId = current.id
      }

      tocLinks.forEach(function (link) {
        var href = link.getAttribute('href') || ''
        var isActive = href === '#' + visibleId

        link.classList.toggle('toc__link--active', isActive)
      })
    }, { rootMargin: '-8% 0px -72% 0px', threshold: 0 })

    headings.forEach(function (heading) { tocObserver.observe(heading) })
  }

  /* ---------- IntersectionObserver：reveal ---------- */
  function initReveal() {
    if (revealObserver) revealObserver.disconnect()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('#' + PJAX_CONTAINER_ID + ' .reveal').forEach(function (el) {
        el.classList.add('is-visible')
      })
      return
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    var candidates = document.querySelectorAll('#' + PJAX_CONTAINER_ID + ' .series-card, #' + PJAX_CONTAINER_ID + ' .series-chapter, #' + PJAX_CONTAINER_ID + ' .markdown-body h2, #' + PJAX_CONTAINER_ID + ' .markdown-body h3, #' + PJAX_CONTAINER_ID + ' .post-list__item')

    candidates.forEach(function (el) {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal')
      }
      revealObserver.observe(el)
    })

    // 视口内元素立即显示，避免闪烁
    window.requestAnimationFrame(function () {
      candidates.forEach(function (el) {
        var rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible')
        }
      })
    })
  }

  /* ---------- Canvas 粒子动画 ---------- */
  function initHeroCanvas() {
    var canvas = document.getElementById(HERO_CANVAS_ID)
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (heroCleanup) {
      heroCleanup()
      heroCleanup = null
    }

    var ctx = canvas.getContext('2d')
    var wrap = canvas.parentElement
    var dpr = Math.min(2, window.devicePixelRatio || 1)
    var width = 0
    var height = 0
    var particles = []
    var rafId = null

    function resize() {
      if (!wrap) return

      var rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      var count = Math.min(70, Math.max(24, Math.round((width * height) / 7000)))

      particles = []
      for (var i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        })
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height)

      for (var i = 0; i < particles.length; i += 1) {
        var p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(64, 95, 125, 0.55)'
        ctx.fill()
      }

      for (var i = 0; i < particles.length; i += 1) {
        for (var j = i + 1; j < particles.length; j += 1) {
          var a = particles[i]
          var b = particles[j]
          var dx = a.x - b.x
          var dy = a.y - b.y
          var dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(64, 95, 125, ' + (0.16 * (1 - dist / 110)).toFixed(3) + ')'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      rafId = window.requestAnimationFrame(step)
    }

    resize()
    step()

    var resizeTimer = null
    var onResize = function () {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 150)
    }
    window.addEventListener('resize', onResize)

    heroCleanup = function () {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      ctx = null
    }
  }

  /* ---------- 页面增强入口 ---------- */
  function initPageEnhancements() {
    enhanceCodeBlocks(mainElement)
    initTocHighlight()
    initReveal()
    initTiltCards()
    initHeroCanvas()
    scrollCurrentChapterIntoView()
    updateProgress()
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null
      if (!isInternalLink(link)) return

      var url = link.href
      if (url === window.location.href) {
        closeDrawer()
        return
      }

      event.preventDefault()
      loadPage(url, true)
    })

    document.addEventListener('click', function (event) {
      var toggle = event.target.closest ? event.target.closest('.toc__toggle') : null
      if (!toggle) return

      var toc = document.getElementById(TOC_ID)
      if (!toc) return

      var isOpen = toc.classList.toggle('toc--open')
      toggle.setAttribute('aria-expanded', String(isOpen))
    })

    document.addEventListener('click', function (event) {
      var btn = event.target.closest ? event.target.closest('[data-copy]') : null
      if (!btn) return

      var block = btn.closest('.code-block')
      var code = block ? block.querySelector('code') : null
      if (!code) return

      var text = code.textContent

      function restore() {
        btn.textContent = '复制'
        btn.classList.remove('code-block__copy--done')
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '已复制'
          btn.classList.add('code-block__copy--done')
          window.setTimeout(restore, 2000)
        }).catch(function () { restore() })
        return
      }

      var textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        btn.textContent = '已复制'
        btn.classList.add('code-block__copy--done')
        window.setTimeout(restore, 2000)
      } catch (err) {
        console.warn('复制失败：', err)
      }
      document.body.removeChild(textarea)
    })

    window.addEventListener('popstate', function () {
      loadPage(window.location.href, false)
    })

    window.addEventListener('scroll', function () {
      if (rafPending) return

      rafPending = true
      window.requestAnimationFrame(function () {
        updateProgress()
        rafPending = false
      })
    }, { passive: true })
  }

  /* ---------- 启动 ---------- */
  initTheme()
  bindEvents()
  initBackToTop()
  initCursorGlow()
  initPageEnhancements()
})()
