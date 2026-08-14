#!/usr/bin/env node
/* =========================================================
   build.js - 个人博客构建脚本
   扫描 content/posts/*.md，解析 front matter，
   使用 marked 渲染正文，输出静态站点到 public/。
   ========================================================= */

'use strict'

const fs = require('fs')
const path = require('path')
const { marked } = require('marked')
const yaml = require('js-yaml')

const ROOT = path.resolve(__dirname)
const CONFIG_PATH = path.join(ROOT, 'config.json')
const CONTENT_DIR = path.join(ROOT, 'content')
const POSTS_DIR = path.join(CONTENT_DIR, 'posts')
const PAGES_DIR = path.join(CONTENT_DIR, 'pages')
const PUBLIC_DIR = path.join(ROOT, 'public')
const SRC_DIR = path.join(ROOT, 'src')
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates')
const ASSETS_SRC_DIR = path.join(SRC_DIR, 'assets')
const ASSETS_OUT_DIR = path.join(PUBLIC_DIR, 'assets')
const PRISM_SRC_DIR = path.join(ROOT, 'node_modules', 'prismjs')
const PRISM_OUT_DIR = path.join(ASSETS_OUT_DIR, 'vendor', 'prism')

const FILE_NAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 读取根目录 config.json */
function readConfig() {
  const defaultConfig = {
    siteName: 'Tutorial Blog',
    homePostCount: 5,
    avatar: 'assets/images/avatar.svg',
    backgroundImage: 'assets/images/background.svg'
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
    return Object.assign(defaultConfig, JSON.parse(raw))
  } catch (err) {
    console.warn('未找到 config.json，使用默认配置')
    return defaultConfig
  }
}

/** HTML 转义 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 将配置中的资源路径转换为站点根相对路径 */
function toRootPath(value) {
  const text = String(value || '').trim()

  if (!text || text.charAt(0) === '/' || /^https?:\/\//i.test(text)) return text

  return '/' + text
}

/** 根据页面深度拼接相对路径 */
function linkTo(relRoot, target) {
  const path = String(target || '')
  if (/^https?:\/\//i.test(path) || path.charAt(0) === '#') return path

  return relRoot + path.replace(/^\//, '')
}

/** 将系列名转换为 URL/目录安全形式（仅替换路径分隔符） */
function getSeriesPathName(name) {
  const pathName = String(name).replace(/[\/\\]/g, '-').trim() || 'series'

  if (pathName === '.' || pathName === '..') return 'series'

  return pathName
}

/**
 * 渲染简单模板，支持 {{{KEY}}} 原样输出与 {{KEY}} 转义输出
 * @param {string} template
 * @param {Object} data
 * @returns {string}
 */
function renderTemplate(template, data) {
  return template
    .replace(/\{\{\{([A-Z_]+)\}\}\}/g, function (_, key) {
      return data[key] === undefined || data[key] === null ? '' : String(data[key])
    })
    .replace(/\{\{([A-Z_]+)\}\}/g, function (_, key) {
      return data[key] === undefined || data[key] === null ? '' : escapeHtml(String(data[key]))
    })
}

/** 加载模板文件 */
function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf8')
}

/**
 * 解析 Hexo 格式 front matter（YAML）
 * @param {string} raw
 * @returns {{ data: Object, body: string }}
 */
function parseFrontMatter(raw) {
  const text = raw.replace(/^\uFEFF/, '')
  const match = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)

  if (!match) {
    return { data: {}, body: text }
  }

  let data = {}

  try {
    data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {}
  } catch (err) {
    throw new Error('front matter 解析失败：' + err.message)
  }

  return { data, body: text.slice(match[0].length) }
}

/** 将 YAML 标量/数组统一为字符串数组 */
function normalizeStringList(value) {
  if (value === undefined || value === null) return []

  if (Array.isArray(value)) {
    return value.map(function (item) { return String(item).trim() }).filter(Boolean)
  }

  const text = String(value).trim()
  if (text === '') return []

  return text
    .split(',')
    .map(function (item) { return item.trim().replace(/^['"]|['"]$/g, '') })
    .filter(Boolean)
}

/**
 * 从文件名中提取 slug（去掉日期部分）
 * @param {string} fileName
 * @param {Object} frontMatter
 * @returns {string|null}
 */
function extractSlug(fileName, frontMatter) {
  if (frontMatter.slug !== undefined && String(frontMatter.slug).trim() !== '') {
    return normalizeSlug(String(frontMatter.slug).trim())
  }

  const match = fileName.match(FILE_NAME_RE)
  if (!match) return null

  return normalizeSlug(match[4])
}

/** 将 slug 规范化为 URL/目录安全形式 */
function normalizeSlug(slug) {
  const normalized = String(slug)
    .trim()
    .replace(/[<>:"/\\|?*#\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!normalized || normalized === '.' || normalized === '..') return null

  return normalized
}

/**
 * 解析日期：优先 front matter date，失败降级为 mtime
 * @param {string|undefined} dateStr
 * @param {Date|null} mtime
 * @returns {Date|null}
 */
function parseDate(dateStr, mtime) {
  if (dateStr !== undefined && String(dateStr).trim() !== '') {
    const parsed = new Date(String(dateStr).trim())
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  if (mtime && !Number.isNaN(mtime.getTime())) return new Date(mtime)

  return null
}

/** 格式化为英文日期：Aug 13, 2026 */
function formatDateEn(date) {
  if (!date || Number.isNaN(date.getTime())) return ''

  return MONTHS_EN[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
}

/** 估算阅读时长（分钟） */
function calcReadingTime(markdown) {
  const text = String(markdown || '').replace(/```[\s\S]*?```/g, '')
  const chars = text.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.round(chars / 400))

  return minutes
}

/**
 * 渲染 Markdown 并生成 h2/h3 目录
 * @param {string} markdown
 * @returns {{ html: string, toc: Array<{ depth: number, text: string, id: string }> }}
 */
function renderMarkdownWithToc(markdown) {
  const tokens = marked.lexer(markdown)
  const headingTokens = tokens.filter(function (token) { return token.type === 'heading' })
  const toc = []
  const headingIds = headingTokens.map(function (token, index) {
    const id = 'heading-' + (index + 1)

    if (token.depth === 2 || token.depth === 3) {
      toc.push({ depth: token.depth, text: token.text, id: id })
    }

    return id
  })

  let cursor = 0
  const renderer = new marked.Renderer()

  renderer.heading = function (text, level) {
    const id = headingIds[cursor]
    cursor += 1

    if (level === 2 || level === 3) {
      return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>\n'
    }

    return '<h' + level + '>' + text + '</h' + level + '>\n'
  }

  const html = marked.parse(markdown, { renderer })

  return { html, toc }
}

/**
 * 读取并解析 content/posts/*.md
 * @returns {Array<Object>}
 */
function collectPosts() {
  let files = []

  try {
    files = fs.readdirSync(POSTS_DIR)
  } catch (err) {
    return []
  }

  const posts = []

  files.forEach(function (file) {
    if (!file.endsWith('.md')) return

    const fileMatch = file.match(FILE_NAME_RE)
    if (!fileMatch) {
      console.warn('跳过不符合文件名格式的文章：' + file)
      return
    }

    const filePath = path.join(POSTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = parseFrontMatter(raw)
    const frontMatter = parsed.data

    let stat = null
    try {
      stat = fs.statSync(filePath)
    } catch (err) {
      // 文件可能被删除，忽略
    }

    const mtime = stat ? stat.mtime : null
    const date = parseDate(frontMatter.date, mtime)
    const slug = extractSlug(file, frontMatter)

    if (!slug) {
      console.warn('无法提取 slug，跳过文章：' + file)
      return
    }

    const categories = normalizeStringList(frontMatter.categories)
    const tags = normalizeStringList(frontMatter.tags)
    // 系列名优先取 front matter.series，否则回退到 Hexo categories 的第一个分类
    const series = frontMatter.series !== undefined && String(frontMatter.series).trim() !== ''
      ? String(frontMatter.series).trim()
      : (categories.length > 0 ? categories[0] : '')
    const seriesIndexRaw = frontMatter.series_index !== undefined ? String(frontMatter.series_index).trim() : ''
    let seriesIndex = null

    if (seriesIndexRaw !== '') {
      const parsedIndex = Number(seriesIndexRaw)
      if (Number.isFinite(parsedIndex)) seriesIndex = parsedIndex
    }

    const rendered = renderMarkdownWithToc(parsed.body)
    const readingTime = calcReadingTime(parsed.body)

    posts.push({
      title: frontMatter.title !== undefined ? String(frontMatter.title).trim() : fileMatch[4],
      date: date ? date.toISOString() : null,
      dateFormatted: date ? formatDateEn(date) : '',
      dateTimestamp: date ? date.getTime() : null,
      createdAtTimestamp: stat ? (stat.birthtimeMs || stat.ctimeMs || 0) : 0,
      tags: tags,
      categories: categories,
      description: frontMatter.description !== undefined ? String(frontMatter.description).trim() : '',
      series: series,
      seriesIndex: seriesIndex,
      seriesIndexRaw: seriesIndexRaw,
      chapterName: frontMatter.chapter_name !== undefined ? String(frontMatter.chapter_name).trim() : '',
      slug: slug,
      url: '/posts/' + encodeURIComponent(slug) + '/',
      file: file,
      markdown: parsed.body,
      html: rendered.html,
      toc: rendered.toc,
      readingTime: readingTime
    })
  })

  return posts
}

/** 按首页最近文章规则排序 */
function sortByDateDesc(posts) {
  return posts.slice().sort(function (a, b) {
    const aTime = a.dateTimestamp
    const bTime = b.dateTimestamp

    if (aTime !== null && bTime !== null) {
      if (aTime !== bTime) return bTime - aTime

      const aCreated = a.createdAtTimestamp || 0
      const bCreated = b.createdAtTimestamp || 0

      if (aCreated !== bCreated) return bCreated - aCreated

      return a.title.localeCompare(b.title, 'zh')
    }

    if (aTime !== null) return -1
    if (bTime !== null) return 1

    return a.title.localeCompare(b.title, 'zh')
  })
}

/** 按 series_index 升序，同值按标题字母排序 */
function sortBySeriesIndex(posts) {
  return posts.slice().sort(function (a, b) {
    const aIndex = a.seriesIndex
    const bIndex = b.seriesIndex

    if (aIndex !== null && bIndex !== null) {
      if (aIndex !== bIndex) return aIndex - bIndex

      return a.title.localeCompare(b.title, 'zh')
    }

    if (aIndex !== null) return -1
    if (bIndex !== null) return 1

    return a.title.localeCompare(b.title, 'zh')
  })
}

/** 构建 series -> posts 的映射 */
function buildSeriesMap(posts) {
  const map = new Map()

  posts.forEach(function (post) {
    if (!post.series) return

    if (!map.has(post.series)) map.set(post.series, [])
    map.get(post.series).push(post)
  })

  return map
}

/** 获取某系列下最新文章日期时间戳 */
function getLatestTimestamp(posts) {
  return posts.reduce(function (max, post) {
    const timestamp = post.dateTimestamp
    return timestamp !== null && (max === null || timestamp > max) ? timestamp : max
  }, null)
}

/** 校验同一系列同一章节的 chapter_name 是否一致 */
function validateChapterNames(posts) {
  const groups = new Map()

  posts.forEach(function (post) {
    if (!post.series || post.seriesIndex === null) return

    const chapterNumber = Math.floor(post.seriesIndex)
    const key = post.series + '::' + chapterNumber

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(post)
  })

  groups.forEach(function (group, key) {
    const names = Array.from(new Set(group.map(function (post) {
      return post.chapterName
    }).filter(Boolean)))

    if (names.length > 1) {
      const parts = key.split('::')
      throw new Error(
        'chapter_name 不一致：系列「' + parts[0] + '」第 ' + parts[1] + ' 章同时存在 ' +
        names.map(function (name) { return '「' + name + '」' }).join(' 和 ')
      )
    }
  })
}

/**
 * 将系列文章按章节分组
 * @param {Array<Object>} posts
 * @returns {Array<{ chapterNumber: number|null, chapterName: string, posts: Array<Object> }>}
 */
function groupPostsByChapter(posts) {
  const sorted = sortBySeriesIndex(posts)
  const map = new Map()

  sorted.forEach(function (post) {
    const key = post.seriesIndex === null ? '__unfiled__' : String(Math.floor(post.seriesIndex))

    if (!map.has(key)) map.set(key, [])
    map.get(key).push(post)
  })

  const groups = []

  map.forEach(function (items, key) {
    if (key === '__unfiled__') {
      groups.push({ chapterNumber: null, chapterName: '未分章节', posts: items })
      return
    }

    const chapterNumber = Number(key)
    const names = Array.from(new Set(items.map(function (post) {
      return post.chapterName
    }).filter(Boolean)))
    const chapterName = names[0] || '第' + chapterNumber + '章'

    groups.push({ chapterNumber: chapterNumber, chapterName: chapterName, posts: items })
  })

  groups.sort(function (a, b) {
    if (a.chapterNumber === null && b.chapterNumber === null) return 0
    if (a.chapterNumber === null) return 1
    if (b.chapterNumber === null) return -1

    return a.chapterNumber - b.chapterNumber
  })

  return groups
}

/** 构建功能栏侧边栏（首页/系列总览/关于页等非文章页使用） */
function buildToolbarSidebarHtml(currentUrl, relRoot) {
  const items = [
    { title: '首页', path: '/' },
    { title: '系列', path: '/series/' },
    { title: '关于我', path: '/about/' }
  ]

  const htmlParts = ['<ul class="sidebar-nav__list">']

  items.forEach(function (item) {
    const isActive = item.path === currentUrl

    htmlParts.push(
      '<li class="sidebar-nav__item">' +
      '<a class="sidebar-nav__link' + (isActive ? ' sidebar-nav__link--active' : '') + '" ' +
      'href="' + linkTo(relRoot, item.path) + '" data-nav-link="' + item.path + '"' +
      (isActive ? ' aria-current="page"' : '') + '>' +
      escapeHtml(item.title) +
      '</a>' +
      '</li>'
    )
  })

  htmlParts.push('</ul>')

  return htmlParts.join('\n')
}

/** 构建当前系列的章节目录侧边栏（文章页使用） */
function buildSeriesSidebarHtml(posts, currentUrl, seriesName, relRoot) {
  const seriesPosts = posts.filter(function (post) { return post.series === seriesName })
  if (seriesPosts.length === 0) return buildToolbarSidebarHtml(currentUrl, relRoot)

  const chapters = groupPostsByChapter(seriesPosts)
  const htmlParts = []

  htmlParts.push(
    '<p class="sidebar-series__back">' +
    '<a class="sidebar-series__back-link" href="' + linkTo(relRoot, '/series/' + encodeURIComponent(getSeriesPathName(seriesName)) + '/') + '">← ' + escapeHtml(seriesName) + '</a>' +
    '</p>'
  )

  chapters.forEach(function (chapter) {
    const chapterNumber = chapter.chapterNumber === null ? -1 : chapter.chapterNumber
    const isCurrentChapter = chapter.posts.some(function (post) { return post.url === currentUrl })

    htmlParts.push('<details class="sidebar-chapter"' + (isCurrentChapter ? ' open' : '') + ' data-chapter="' + chapterNumber + '">')
    htmlParts.push('<summary class="sidebar-chapter__title">' + escapeHtml(chapter.chapterName) + '</summary>')
    htmlParts.push('<ul class="sidebar-chapter__list">')

    chapter.posts.forEach(function (post) {
      const isActive = post.url === currentUrl

      htmlParts.push(
        '<li class="sidebar-chapter__item">' +
        '<a class="sidebar-chapter__link' + (isActive ? ' sidebar-chapter__link--active' : '') + '" ' +
        'href="' + linkTo(relRoot, post.url) + '" data-nav-link="' + post.url + '"' +
        (isActive ? ' aria-current="page"' : '') + '>' +
        escapeHtml(post.title) +
        '</a>' +
        '</li>'
      )
    })

    htmlParts.push('</ul>')
    htmlParts.push('</details>')
  })

  return htmlParts.join('\n')
}

/** 构建右侧 TOC HTML */
function buildTocHtml(tocItems) {
  if (!tocItems || tocItems.length === 0) return ''

  const htmlParts = ['<ul class="toc__list">']

  tocItems.forEach(function (item) {
    const levelClass = item.depth === 3 ? ' toc__link--h3' : ''

    htmlParts.push(
      '<li class="toc__item">' +
      '<a class="toc__link' + levelClass + '" href="#' + item.id + '">' + escapeHtml(item.text) + '</a>' +
      '</li>'
    )
  })

  htmlParts.push('</ul>')

  return htmlParts.join('\n')
}

/** 构建首页「最近文章」列表 */
function buildRecentPostsHtml(posts, limit, relRoot) {
  const recent = sortByDateDesc(posts).slice(0, limit)

  if (recent.length === 0) {
    return '<li class="post-list__item">暂无文章</li>'
  }

  return recent.map(function (post) {
    const dateHtml = post.dateFormatted
      ? '<time class="post-list__date" datetime="' + post.date + '">' + post.dateFormatted + '</time>'
      : '<time class="post-list__date">日期未知</time>'

    return (
      '<li class="post-list__item">' +
      '<a class="post-list__link" href="' + linkTo(relRoot, post.url) + '">' + escapeHtml(post.title) + '</a>' +
      dateHtml +
      '</li>'
    )
  }).join('\n')
}

/** 构建系列总览页入口列表 */
function buildSeriesLinksHtml(posts, relRoot) {
  const seriesMap = buildSeriesMap(posts)
  const seriesEntries = Array.from(seriesMap.entries()).map(function (entry) {
    return {
      name: entry[0],
      posts: entry[1],
      latestTimestamp: getLatestTimestamp(entry[1])
    }
  }).sort(function (a, b) {
    const aTime = a.latestTimestamp || 0
    const bTime = b.latestTimestamp || 0

    if (aTime !== bTime) return bTime - aTime

    return a.name.localeCompare(b.name, 'zh')
  })

  if (seriesEntries.length === 0) {
    return '<li class="series-list__item">暂无系列</li>'
  }

  return seriesEntries.map(function (entry) {
    const name = entry.name
    const count = entry.posts.length

    return (
      '<li class="series-list__item">' +
      '<a class="series-list__link" href="' + linkTo(relRoot, '/series/' + encodeURIComponent(getSeriesPathName(name)) + '/') + '">' + escapeHtml(name) + '</a>' +
      '<span class="series-list__count">' + count + ' 篇</span>' +
      '</li>'
    )
  }).join('\n')
}

/** 构建首页系列入口卡片 */
function buildSeriesCardsHtml(posts, relRoot) {
  const seriesMap = buildSeriesMap(posts)
  const seriesEntries = Array.from(seriesMap.entries()).map(function (entry) {
    return {
      name: entry[0],
      posts: entry[1],
      latestTimestamp: getLatestTimestamp(entry[1])
    }
  }).sort(function (a, b) {
    const aTime = a.latestTimestamp || 0
    const bTime = b.latestTimestamp || 0

    if (aTime !== bTime) return bTime - aTime

    return a.name.localeCompare(b.name, 'zh')
  })

  if (seriesEntries.length === 0) {
    return '<p class="series-cards__empty">暂无系列</p>'
  }

  return seriesEntries.map(function (entry) {
    const latestPost = sortByDateDesc(entry.posts)[0]
    const latestDate = latestPost && latestPost.dateFormatted ? latestPost.dateFormatted : '日期未知'

    return (
      '<article class="series-card tilt-card">' +
      '<a class="series-card__link" href="' + linkTo(relRoot, '/series/' + encodeURIComponent(getSeriesPathName(entry.name)) + '/') + '">' +
      '<h3 class="series-card__title">' + escapeHtml(entry.name) + '</h3>' +
      '<p class="series-card__meta">' + entry.posts.length + ' 篇文章 · 最近更新 ' + escapeHtml(latestDate) + '</p>' +
      '</a>' +
      '</article>'
    )
  }).join('\n')
}

/** 构建首页独立文章列表 */
function buildStandalonePostsHtml(posts, relRoot) {
  const standalone = sortByDateDesc(posts.filter(function (post) { return !post.series }))

  if (standalone.length === 0) {
    return '<li class="post-list__item">暂无独立文章</li>'
  }

  return standalone.map(function (post) {
    const dateHtml = post.dateFormatted
      ? '<time class="post-list__date" datetime="' + post.date + '">' + post.dateFormatted + '</time>'
      : '<time class="post-list__date">日期未知</time>'

    return (
      '<li class="post-list__item">' +
      '<a class="post-list__link" href="' + linkTo(relRoot, post.url) + '">' + escapeHtml(post.title) + '</a>' +
      dateHtml +
      '</li>'
    )
  }).join('\n')
}

/** 构建文章底部本系列导航（折叠列表 + 上一篇/下一篇） */
function buildSeriesNavHtml(posts, currentPost, relRoot) {
  if (!currentPost.series) return ''

  const seriesPosts = posts.filter(function (post) { return post.series === currentPost.series })
  if (seriesPosts.length === 0) return ''

  const sorted = sortBySeriesIndex(seriesPosts)
  const currentIndex = sorted.findIndex(function (post) { return post.slug === currentPost.slug })
  const prevPost = currentIndex > 0 ? sorted[currentIndex - 1] : null
  const nextPost = currentIndex >= 0 && currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null

  const htmlParts = []

  htmlParts.push('<nav class="series-nav" aria-label="本系列文章导航">')
  htmlParts.push('<details class="series-nav__details">')
  htmlParts.push('<summary class="series-nav__summary">本系列文章</summary>')
  htmlParts.push('<ol class="series-nav__list">')

  sorted.forEach(function (post) {
    const isActive = post.slug === currentPost.slug

    htmlParts.push(
      '<li class="series-nav__item' + (isActive ? ' series-nav__item--active' : '') + '">' +
      '<a href="' + linkTo(relRoot, post.url) + '">' + escapeHtml(post.title) + '</a>' +
      (isActive ? ' <span class="series-nav__current">（当前）</span>' : '') +
      '</li>'
    )
  })

  htmlParts.push('</ol>')
  htmlParts.push('</details>')
  htmlParts.push('<div class="series-nav__pager">')

  if (prevPost) {
    htmlParts.push(
      '<a class="series-nav__pager-link" href="' + linkTo(relRoot, prevPost.url) + '">' +
      '<span class="series-nav__direction">← 上一章</span>' +
      '<span class="series-nav__pager-title">' + escapeHtml(prevPost.title) + '</span>' +
      '</a>'
    )
  } else {
    htmlParts.push(
      '<span class="series-nav__pager-link series-nav__pager-link--disabled">' +
      '<span class="series-nav__direction">← 上一章</span>' +
      '<span class="series-nav__pager-title">没有上一章</span>' +
      '</span>'
    )
  }

  if (nextPost) {
    htmlParts.push(
      '<a class="series-nav__pager-link series-nav__pager-link--next" href="' + linkTo(relRoot, nextPost.url) + '">' +
      '<span class="series-nav__direction">下一章 →</span>' +
      '<span class="series-nav__pager-title">' + escapeHtml(nextPost.title) + '</span>' +
      '</a>'
    )
  } else {
    htmlParts.push(
      '<span class="series-nav__pager-link series-nav__pager-link--next series-nav__pager-link--disabled">' +
      '<span class="series-nav__direction">下一章 →</span>' +
      '<span class="series-nav__pager-title">没有下一章</span>' +
      '</span>'
    )
  }

  htmlParts.push('</div>')
  htmlParts.push('</nav>')

  return htmlParts.join('\n')
}

/** 构建系列合集页章节 HTML */
function buildSeriesChaptersHtml(posts, seriesName, relRoot) {
  const seriesPosts = posts.filter(function (post) { return post.series === seriesName })
  const groups = groupPostsByChapter(seriesPosts)

  if (groups.length === 0) {
    return '<p>暂无文章</p>'
  }

  const htmlParts = []

  groups.forEach(function (group) {
    htmlParts.push('<section class="series-chapter">')
    htmlParts.push('<h2 class="series-chapter__title">' + escapeHtml(group.chapterName) + '</h2>')
    htmlParts.push('<ul class="series-chapter__list">')

    group.posts.forEach(function (post) {
      const indexText = post.seriesIndexRaw !== '' ? post.seriesIndexRaw : (post.seriesIndex === null ? '—' : String(post.seriesIndex))
      const dateText = post.dateFormatted || '日期未知'

      htmlParts.push(
        '<li class="series-chapter__item">' +
        '<span class="series-chapter__index">' + escapeHtml(indexText) + '</span>' +
        '<a class="series-chapter__link" href="' + linkTo(relRoot, post.url) + '">' + escapeHtml(post.title) + '</a>' +
        '<time class="series-chapter__date" datetime="' + (post.date || '') + '">' + dateText + '</time>' +
        '</li>'
      )
    })

    htmlParts.push('</ul>')
    htmlParts.push('</section>')
  })

  return htmlParts.join('\n')
}

/** 将正文中的 .md 站内链接改写为文章 URL */
function rewriteMdLinks(html, posts, relRoot) {
  const fileMap = new Map()

  posts.forEach(function (post) {
    fileMap.set(post.file, post.url)
    fileMap.set(encodeURIComponent(post.file), post.url)
  })

  return html.replace(/href="([^"]*\.md)(#[^"]*)?"/g, function (match, href, hash) {
    const decoded = href.split('/').pop()
    const target = fileMap.get(decoded) || fileMap.get(href)

    if (!target) return match

    return 'href="' + linkTo(relRoot, target) + (hash || '') + '"'
  })
}

/** 构建面包屑导航 */
function buildBreadcrumbHtml(items, relRoot) {
  const htmlParts = ['<nav class="breadcrumb" aria-label="面包屑">']

  items.forEach(function (item, index) {
    if (index > 0) {
      htmlParts.push('<span class="breadcrumb__sep">/</span>')
    }

    if (item.path) {
      htmlParts.push('<a class="breadcrumb__link" href="' + linkTo(relRoot, item.path) + '">' + escapeHtml(item.label) + '</a>')
    } else {
      htmlParts.push('<span class="breadcrumb__current">' + escapeHtml(item.label) + '</span>')
    }
  })

  htmlParts.push('</nav>')

  return htmlParts.join('\n')
}

/** 构建文章页元信息徽章 */
function buildPostBadgesHtml(post, relRoot) {
  const htmlParts = ['<span class="post__badges">']

  if (post.series) {
    const seriesPath = '/series/' + encodeURIComponent(getSeriesPathName(post.series)) + '/'

    htmlParts.push('<a class="post__badge post__badge--series" href="' + linkTo(relRoot, seriesPath) + '">' + escapeHtml(post.series) + '</a>')
    if (post.chapterName) {
      htmlParts.push('<span class="post__badge post__badge--chapter">' + escapeHtml(post.chapterName) + '</span>')
    }
  } else {
    htmlParts.push('<span class="post__badge post__badge--standalone">独立文章</span>')
  }

  htmlParts.push('</span>')

  return htmlParts.join('\n')
}

/** 生成单页完整 HTML */
function renderPage(pageData) {
  const layoutTemplate = loadTemplate('layout.html')
  const relRoot = pageData.relRoot || './'
  const postsJson = JSON.stringify(pageData.postsData).replace(/</g, '\\u003c')
  const backgroundImage = toRootPath(pageData.backgroundImage)
  const avatarImage = toRootPath(pageData.avatar)
  const backgroundStyle = backgroundImage
    ? "background-image: url('" + escapeHtml(linkTo(relRoot, backgroundImage)) + "');"
    : ''
  const avatarHtml = avatarImage
    ? '<img class="sidebar__avatar" src="' + escapeHtml(linkTo(relRoot, avatarImage)) + '" alt="站点头像">'
    : ''

  const data = {
    SITE_NAME: pageData.siteName,
    PAGE_TYPE: pageData.pageType,
    PAGE_TITLE: pageData.pageTitle,
    REL_ROOT: relRoot,
    SIDEBAR_HTML: pageData.sidebarHtml,
    MAIN_CONTENT: pageData.mainContent,
    TOC_CLASS: pageData.tocClass !== undefined ? pageData.tocClass : 'toc--empty',
    TOC_HTML: pageData.tocHtml || '',
    POSTS_JSON: postsJson,
    BACKGROUND_STYLE: backgroundStyle,
    AVATAR_HTML: avatarHtml
  }

  return renderTemplate(layoutTemplate, data)
}

/** 写入 HTML 文件 */
function writeHtml(relativePath, html) {
  const filePath = path.join(PUBLIC_DIR, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, html, 'utf8')
}

/** 复制静态资源到 public/assets/ */
function copyAssets() {
  fs.mkdirSync(ASSETS_OUT_DIR, { recursive: true })
  fs.cpSync(ASSETS_SRC_DIR, ASSETS_OUT_DIR, { recursive: true })
}

/** 合并并复制 Prism 高亮资源 */
function copyPrismAssets() {
  fs.mkdirSync(PRISM_OUT_DIR, { recursive: true })

  const componentNames = ['prism-python.js', 'prism-bash.js', 'prism-json.js', 'prism-rust.js', 'prism-yaml.js', 'prism-toml.js']
  let bundle = fs.readFileSync(path.join(PRISM_SRC_DIR, 'prism.js'), 'utf8')

  componentNames.forEach(function (name) {
    bundle += '\n;' + fs.readFileSync(path.join(PRISM_SRC_DIR, 'components', name), 'utf8')
  })

  fs.writeFileSync(path.join(PRISM_OUT_DIR, 'prism-bundle.js'), bundle, 'utf8')
  fs.copyFileSync(path.join(PRISM_SRC_DIR, 'themes', 'prism.css'), path.join(PRISM_OUT_DIR, 'prism.css'))
}

/** 生成全量数据数组（用于内联 JSON 与独立 posts.json） */
function buildPostsData(posts) {
  return posts.map(function (post) {
    return {
      title: post.title,
      date: post.date,
      dateFormatted: post.dateFormatted,
      tags: post.tags,
      categories: post.categories,
      description: post.description,
      series: post.series || null,
      seriesIndex: post.seriesIndex,
      seriesIndexRaw: post.seriesIndexRaw,
      chapterName: post.chapterName,
      slug: post.slug,
      url: post.url,
      file: post.file,
      readingTime: post.readingTime,
      markdown: post.markdown,
      html: post.html,
      toc: post.toc
    }
  })
}

/** 主构建流程 */
function main() {
  const config = readConfig()
  const siteName = String(config.siteName || 'Tutorial Blog')
  const configuredCount = Number(config.homePostCount)
  const homePostCount = Number.isFinite(configuredCount) && configuredCount >= 0 ? Math.floor(configuredCount) : 5
  const avatar = String(config.avatar || '')
  const backgroundImage = String(config.backgroundImage || '')
  const posts = collectPosts()

  if (posts.length === 0) {
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true })
    fs.mkdirSync(PUBLIC_DIR, { recursive: true })
    console.log('content/posts/ 目录为空，跳过构建，已输出空 public 目录')
    return
  }

  validateChapterNames(posts)

  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true })
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })

  const postsData = buildPostsData(posts)
  const pageCommon = {
    siteName: siteName,
    avatar: avatar,
    backgroundImage: backgroundImage,
    postsData: postsData
  }

  // 首页
  const homeRelRoot = './'
  const homeTemplate = loadTemplate('home.html')
  const homeMainContent = renderTemplate(homeTemplate, {
    SITE_NAME: siteName,
    RECENT_POSTS: buildRecentPostsHtml(posts, homePostCount, homeRelRoot),
    SERIES_CARDS: buildSeriesCardsHtml(posts, homeRelRoot),
    STANDALONE_POSTS: buildStandalonePostsHtml(posts, homeRelRoot)
  })
  const homeHtml = renderPage(Object.assign({}, pageCommon, {
    relRoot: homeRelRoot,
    pageType: 'home',
    pageTitle: '首页',
    sidebarHtml: buildToolbarSidebarHtml('/', homeRelRoot),
    mainContent: homeMainContent,
    tocClass: 'toc--empty',
    tocHtml: ''
  }))
  writeHtml('index.html', homeHtml)

  // 系列总览页
  const seriesIndexRelRoot = '../'
  const seriesIndexTemplate = loadTemplate('series-index.html')
  const seriesIndexMainContent = renderTemplate(seriesIndexTemplate, {
    SERIES_INDEX_BREADCRUMB: buildBreadcrumbHtml([
      { label: '首页', path: '/' },
      { label: '系列', path: '/series/' }
    ], seriesIndexRelRoot),
    SERIES_INDEX_LIST: buildSeriesCardsHtml(posts, seriesIndexRelRoot)
  })
  const seriesIndexHtml = renderPage(Object.assign({}, pageCommon, {
    relRoot: seriesIndexRelRoot,
    pageType: 'series-index',
    pageTitle: '系列',
    sidebarHtml: buildToolbarSidebarHtml('/series/', seriesIndexRelRoot),
    mainContent: seriesIndexMainContent,
    tocClass: 'toc--empty',
    tocHtml: ''
  }))
  writeHtml('series/index.html', seriesIndexHtml)

  // 文章页
  const postTemplate = loadTemplate('post.html')
  const postRelRoot = '../../'

  posts.forEach(function (post) {
    const tagsHtml = post.tags.length > 0
      ? '<span class="post__tags">' + post.tags.map(function (tag) {
        return '<span class="post__tag">#' + escapeHtml(tag) + '</span>'
      }).join(' ') + '</span>'
      : ''

    const breadcrumbItems = [{ label: '首页', path: '/' }]
    if (post.series) {
      breadcrumbItems.push({
        label: post.series,
        path: '/series/' + encodeURIComponent(getSeriesPathName(post.series)) + '/'
      })
    }
    breadcrumbItems.push({ label: post.title, path: null })

    let mainContent = renderTemplate(postTemplate, {
      POST_BREADCRUMB: buildBreadcrumbHtml(breadcrumbItems, postRelRoot),
      POST_TITLE: post.title,
      POST_DATETIME: post.date || '',
      POST_DATE: post.dateFormatted || '日期未知',
      READING_TIME: post.readingTime,
      POST_BADGES: buildPostBadgesHtml(post, postRelRoot),
      POST_TAGS: tagsHtml,
      POST_CONTENT: post.html,
      SERIES_NAV: buildSeriesNavHtml(posts, post, postRelRoot)
    })
    mainContent = rewriteMdLinks(mainContent, posts, postRelRoot)

    const tocClass = post.toc.length > 0 ? '' : 'toc--empty'
    const sidebarHtml = post.series
      ? buildSeriesSidebarHtml(posts, post.url, post.series, postRelRoot)
      : buildToolbarSidebarHtml(post.url, postRelRoot)

    const pageHtml = renderPage(Object.assign({}, pageCommon, {
      relRoot: postRelRoot,
      pageType: 'post',
      pageTitle: post.title,
      sidebarHtml: sidebarHtml,
      mainContent: mainContent,
      tocClass: tocClass,
      tocHtml: buildTocHtml(post.toc)
    }))

    writeHtml('posts/' + post.slug + '/index.html', pageHtml)
  })

  // 系列详情页
  const seriesTemplate = loadTemplate('series.html')
  const seriesRelRoot = '../../'
  const seriesMap = buildSeriesMap(posts)

  seriesMap.forEach(function (seriesPosts, seriesName) {
    const seriesPathName = getSeriesPathName(seriesName)
    const latestPost = sortByDateDesc(seriesPosts)[0]
    const chapterCount = groupPostsByChapter(seriesPosts).length
    const mainContent = renderTemplate(seriesTemplate, {
      SERIES_BREADCRUMB: buildBreadcrumbHtml([
        { label: '首页', path: '/' },
        { label: '系列', path: '/series/' },
        { label: seriesName, path: null }
      ], seriesRelRoot),
      SERIES_TITLE: seriesName,
      SERIES_COUNT: seriesPosts.length,
      SERIES_CHAPTER_COUNT: chapterCount,
      SERIES_LATEST_DATE: latestPost && latestPost.dateFormatted ? latestPost.dateFormatted : '日期未知',
      SERIES_CHAPTERS: buildSeriesChaptersHtml(posts, seriesName, seriesRelRoot)
    })

    const pageHtml = renderPage(Object.assign({}, pageCommon, {
      relRoot: seriesRelRoot,
      pageType: 'series',
      pageTitle: '系列：' + seriesName,
      sidebarHtml: buildToolbarSidebarHtml('/series/', seriesRelRoot),
      mainContent: mainContent,
      tocClass: 'toc--empty',
      tocHtml: ''
    }))

    writeHtml('series/' + seriesPathName + '/index.html', pageHtml)
  })

  // 关于页
  const aboutRelRoot = '../'
  const aboutTemplate = loadTemplate('about.html')
  let aboutMarkdown = ''

  try {
    aboutMarkdown = fs.readFileSync(path.join(PAGES_DIR, 'about.md'), 'utf8')
  } catch (err) {
    aboutMarkdown = '暂无介绍'
  }

  const aboutRendered = renderMarkdownWithToc(aboutMarkdown)
  const aboutMainContent = renderTemplate(aboutTemplate, {
    ABOUT_BREADCRUMB: buildBreadcrumbHtml([
      { label: '首页', path: '/' },
      { label: '关于我', path: null }
    ], aboutRelRoot),
    ABOUT_CONTENT: aboutRendered.html
  })

  const aboutHtml = renderPage(Object.assign({}, pageCommon, {
    relRoot: aboutRelRoot,
    pageType: 'about',
    pageTitle: '关于我',
    sidebarHtml: buildToolbarSidebarHtml('/about/', aboutRelRoot),
    mainContent: aboutMainContent,
    tocClass: 'toc--empty',
    tocHtml: ''
  }))
  writeHtml('about/index.html', aboutHtml)

  // 独立全量数据 JSON
  fs.writeFileSync(path.join(PUBLIC_DIR, 'posts.json'), JSON.stringify(postsData, null, 2), 'utf8')

  copyAssets()
  copyPrismAssets()

  console.log('构建完成：' + PUBLIC_DIR)
  console.log('文章数：' + posts.length)
  console.log('系列数：' + seriesMap.size)
}


main()
