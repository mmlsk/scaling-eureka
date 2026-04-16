// ═══════════════════════════════════════════════════
// CONFIGURATION MODULE
// ═══════════════════════════════════════════════════
const CONFIG = {
  WEATHER_API: {BASE_URL:'https://api.open-meteo.com/v1',LATITUDE:53.43,LONGITUDE:14.55,TIMEZONE:'Europe/Warsaw',REFRESH_INTERVAL:30*60*1000},
  YAHOO_FINANCE: {BASE_URL:'https://query1.finance.yahoo.com/v8/finance/chart',PROXIES:['','https://corsproxy.io/?url=','https://api.allorigins.win/raw?url='],TIMEOUT:6000},
  FINNHUB_API_KEY:'',
  ALPHA_VANTAGE_KEY:'2YF74FENKEEEQW3E',
  POLYGON_KEY:'SwX5_oDdfj4oFq33v24iafb0hOTHsHCm',
  OPENAQ_KEY:'31be3947719d5998e4cff9ebc398e68ea9f3d2cc9d356b201ad130bc6f48b305',
  OPENUV_KEY:'openuv-4gq73rmnyg313s-io',
  GOOGLE_CAL:{CLIENT_ID:'',CALENDAR_ID:'domagalski.mat@gmail.com',API_KEY:'',SCOPES:'https://www.googleapis.com/auth/calendar.readonly'},
  POLYMARKET:{GAMMA:'https://gamma-api.polymarket.com',DATA:'https://data-api.polymarket.com',CLOB:'https://clob.polymarket.com'},
  LOCATION:{CITY:'Szczecin',COUNTRY:'Poland',CURRENCY:'PLN',LAT:53.43,LON:14.55},
  APP:{STORAGE_VERSION:1,STORAGE_PREFIX:'lifeos_',MAX_TODO_LENGTH:500,MAX_NOTE_LENGTH:5000,TIMER_UPDATE_INTERVAL:250,DEFAULT_PALETTE:'reaktor',DEFAULT_THEME:'dark'},
  PLUGIN:{ENABLED:true,AUTO_LOAD:true,DEBUG_MODE:false,MAX_PLUGINS:50,TIMEOUT:10000,RETRY_ATTEMPTS:3,RETRY_DELAY:1000,SANDBOX_ENABLED:true,ALLOWED_ORIGINS:['https://api.open-meteo.com','https://query1.finance.yahoo.com','https://corsproxy.io','https://api.allorigins.win','https://finnhub.io','https://api.stlouisfed.org','https://fred.stlouisfed.org','https://www.eia.gov','https://api.eia.gov','https://api.openuv.io','https://api.openaq.org','https://danepubliczne.imgw.pl','https://api.rainviewer.com','https://gamma-api.polymarket.com','https://date.nager.at','https://www.googleapis.com','https://air-quality-api.open-meteo.com','https://s3.tradingview.com','https://api.polygon.io','https://www.alphavantage.co']},
  MARKET_NEWS:{FINNHUB_API_KEY:"d7dbke9r01qggoenois0d7dbke9r01qggoenoisg",FRED_API_KEY:"852b3228e1b9ca7a16c17e1144354f3b",EIA_API_KEY:"RLMYQbIgClcwg1Fclj0j86RKwOzZ8FBT6AV4lc6P",REFRESH_INTERVAL:300000,MAX_NEWS:20,ENABLE_SENTIMENT:true},
  WEATHER_ALERTS:{highPM25:{threshold:35,message:'⚠️ Wysokie PM2.5',severity:'warning'},veryHighPM25:{threshold:75,message:'🔴 Bardzo wysokie PM2.5',severity:'critical'},highUV:{threshold:6,message:'☀️ Wysoki UV',severity:'warning'},extremeUV:{threshold:8,message:'🔴 Ekstremalny UV',severity:'critical'},imgwAlert:{message:'⚠️ Alert IMGW',severity:'warning'}}
};

// ═══════════════════════════════════════════════════
// INPUT SANITIZATION & VALIDATION MODULE
// ═══════════════════════════════════════════════════
const sanitize = {
  html: (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  text: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, 500);
  },
  attribute: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9\-_:\s]/g, '').slice(0, 100);
  },
  trim: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, CONFIG.APP.MAX_TODO_LENGTH);
  },
  alphanumeric: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9\s\-_]/g, '').slice(0, 100);
  },
  note: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, CONFIG.APP.MAX_NOTE_LENGTH);
  },
  medicalInput: (val, min, max, fieldName) => {
    const num = parseFloat(val);
    if (isNaN(num)) throw new Error(`${fieldName} musi być liczbą`);
    if (num < min || num > max) throw new Error(`${fieldName} poza zakresem klinicznym (${min}-${max})`);
    return num;
  }
};

// Safe DOM manipulation utilities
const safeDOM = {
  setHTML: (element, htmlString) => {
    if (!element) return;
    element.innerHTML = sanitize.html(htmlString);
  },
  setText: (element, text) => {
    if (!element) return;
    element.textContent = String(text ?? '');
  },
  clear: (element) => {
    if (!element) return;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },
  replaceChildren: (element, ...children) => {
    if (!element) return;
    safeDOM.clear(element);
    children.forEach(child => {
      if (child) element.appendChild(child);
    });
  }
};

const validate = {
  required: (val) => val && val.toString().trim().length > 0,
  maxLength: (val, max) => val && val.length <= max,
  minLength: (val, min) => val && val.length >= min,
  pattern: (val, regex) => regex.test(val || ''),
  todoText: (val) => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed.length <= CONFIG.APP.MAX_TODO_LENGTH;
  }
};

// ═══════════════════════════════════════════════════
// ERROR HANDLING FOR ASYNC OPERATIONS MODULE
// ═══════════════════════════════════════════════════
async function safeFetch(url, options = {}, fallback = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', url, error.message);
    return fallback;
  }
}

async function safeAsync(fn, fallback = null, errorMessage = 'Operation failed') {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error.message);
    return typeof fallback === 'function' ? fallback(error) : fallback;
  }
}

// ═══════════════════════════════════════════════════
// ACCESSIBILITY UTILITIES MODULE
// ═══════════════════════════════════════════════════
const a11y = {
  announce: (message, priority = 'polite') => {
    let announcer = document.getElementById('a11y-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'a11y-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
    setTimeout(() => { announcer.textContent = ''; }, 1000);
  },
  
  manageFocus: (element) => {
    if (element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      setTimeout(() => element.removeAttribute('tabindex'), 100);
    }
  },
  
  trapFocus: (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) {
      focusable[0].focus();
      container.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === focusable[0]) {
            e.preventDefault();
            focusable[focusable.length - 1].focus();
          } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
            e.preventDefault();
            focusable[0].focus();
          }
        }
      });
    }
  }
};

// ═══════════════════════════════════════════════════
// PLUGIN ARCHITECTURE MODULE
// ═══════════════════════════════════════════════════
const PluginSystem = (function() {
  'use strict';
  
  const plugins = new Map();
  const pluginRegistry = new Map();
  const hooks = {
    beforeInit: [],
    afterInit: [],
    beforeRender: [],
    afterRender: [],
    onDataUpdate: [],
    onError: []
  };
  
  // Plugin base class for standardization
  class BasePlugin {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.version = config.version || '1.0.0';
      this.author = config.author || 'Unknown';
      this.description = config.description || '';
      this.config = config.config || {};
      this.state = { initialized: false, active: false, error: null };
      this.api = null;
    }
    
    async init(api) {
      this.api = api;
      this.state.initialized = true;
      this.state.active = true;
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log(`[Plugin] ${this.name} v${this.version} initialized`);
      }
    }
    
    async destroy() {
      this.state.active = false;
      this.state.initialized = false;
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log(`[Plugin] ${this.name} destroyed`);
      }
    }
    
    getConfig(key, defaultValue = null) {
      return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }
    
    setConfig(key, value) {
      this.config[key] = value;
      this.saveConfig();
    }
    
    saveConfig() {
      try {
        const storageKey = `${CONFIG.APP.STORAGE_PREFIX}plugin_${this.id}`;
        localStorage.setItem(storageKey, JSON.stringify(this.config));
      } catch (e) {
        console.error(`[Plugin] ${this.name} config save failed:`, e);
      }
    }
    
    loadConfig() {
      try {
        const storageKey = `${CONFIG.APP.STORAGE_PREFIX}plugin_${this.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          this.config = { ...this.config, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.error(`[Plugin] ${this.name} config load failed:`, e);
      }
    }
    
    render(container) {
      throw new Error('Plugin must implement render() method');
    }
    
    update(data) {
      // Optional: Override to handle data updates
    }
  }
  
  // Plugin API exposed to plugins
  const createPluginAPI = () => ({
    // State access (read-only)
    getState: () => ({ ...state }),
    
    // Safe state updates
    updateState: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ ...state });
        Object.assign(state, newState);
        StorageManager.saveWithDebounce('state', state);
        PluginSystem.triggerHook('onDataUpdate', { state: newState });
      } else if (typeof updater === 'object') {
        Object.assign(state, updater);
        StorageManager.saveWithDebounce('state', updater);
        PluginSystem.triggerHook('onDataUpdate', { state: updater });
      }
    },
    
    // DOM utilities
    createElement: (tag, attributes = {}, children = []) => {
      const el = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = sanitize.html(value);
        else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
      });
      children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
      });
      return el;
    },
    
    safeSetHTML: (element, html) => {
      safeDOM.setHTML(element, html);
    },
    
    // Storage with plugin namespace
    storage: {
      get: (key) => {
        try {
          const storageKey = `${CONFIG.APP.STORAGE_PREFIX}plugin_${key}`;
          const item = localStorage.getItem(storageKey);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.error('[Plugin API] Storage get failed:', e);
          return null;
        }
      },
      set: (key, value) => {
        try {
          const storageKey = `${CONFIG.APP.STORAGE_PREFIX}plugin_${key}`;
          localStorage.setItem(storageKey, JSON.stringify(value));
          return true;
        } catch (e) {
          console.error('[Plugin API] Storage set failed:', e);
          return false;
        }
      },
      remove: (key) => {
        try {
          const storageKey = `${CONFIG.APP.STORAGE_PREFIX}plugin_${key}`;
          localStorage.removeItem(storageKey);
          return true;
        } catch (e) {
          console.error('[Plugin API] Storage remove failed:', e);
          return false;
        }
      }
    },
    
    // Network with security checks
    fetch: async (url, options = {}) => {
      const urlObj = new URL(url, window.location.origin);
      if (!CONFIG.PLUGIN.ALLOWED_ORIGINS.includes(urlObj.origin) && 
          !CONFIG.PLUGIN.ALLOWED_ORIGINS.some(o => url.startsWith(o))) {
        throw new Error(`[Plugin API] Blocked request to unauthorized origin: ${urlObj.origin}`);
      }
      return safeFetch(url, options, null);
    },
    
    // Utility functions
    debounce: (fn, delay) => debounce(fn, delay),
    throttle: (fn, limit) => throttle(fn, limit),
    
    // Logging with plugin context
    log: (...args) => {
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log('[Plugin]', ...args);
      }
    },
    warn: (...args) => console.warn('[Plugin]', ...args),
    error: (...args) => console.error('[Plugin]', ...args)
  });
  
  // Register a plugin class/template
  function register(pluginClass) {
    if (!pluginClass || !pluginClass.prototype || !(pluginClass.prototype instanceof BasePlugin)) {
      throw new Error('Plugin must extend BasePlugin');
    }
    const prototype = pluginClass.prototype;
    const pluginId = prototype.id || pluginClass.name;
    if (!pluginId) {
      throw new Error('Plugin must have an id');
    }
    if (plugins.size >= CONFIG.PLUGIN.MAX_PLUGINS) {
      throw new Error(`Maximum plugin limit (${CONFIG.PLUGIN.MAX_PLUGINS}) reached`);
    }
    pluginRegistry.set(pluginId, pluginClass);
    if (CONFIG.PLUGIN.DEBUG_MODE) {
      console.log(`[PluginSystem] Registered plugin: ${pluginId}`);
    }
    return true;
  }
  
  // Load and instantiate a plugin
  async function load(pluginId, userConfig = {}) {
    const PluginClass = pluginRegistry.get(pluginId);
    if (!PluginClass) {
      throw new Error(`Plugin "${pluginId}" not registered`);
    }
    if (plugins.has(pluginId)) {
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log(`[PluginSystem] Plugin "${pluginId}" already loaded`);
      }
      return plugins.get(pluginId);
    }
    
    const plugin = new PluginClass({ ...PluginClass.prototype, config: userConfig });
    plugin.loadConfig();
    
    try {
      const api = createPluginAPI();
      await Promise.race([
        plugin.init(api),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Plugin initialization timeout')), CONFIG.PLUGIN.TIMEOUT)
        )
      ]);
      
      plugins.set(pluginId, plugin);
      triggerHook('afterInit', { plugin });
      
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log(`[PluginSystem] Loaded plugin: ${pluginId} v${plugin.version}`);
      }
      
      return plugin;
    } catch (error) {
      plugin.state.error = error.message;
      plugin.state.active = false;
      triggerHook('onError', { plugin, error });
      console.error(`[PluginSystem] Failed to load plugin "${pluginId}":`, error);
      throw error;
    }
  }
  
  // Unload a plugin
  async function unload(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return false;
    
    try {
      await plugin.destroy();
      plugins.delete(pluginId);
      triggerHook('afterRender', { plugin, action: 'unload' });
      if (CONFIG.PLUGIN.DEBUG_MODE) {
        console.log(`[PluginSystem] Unloaded plugin: ${pluginId}`);
      }
      return true;
    } catch (error) {
      console.error(`[PluginSystem] Failed to unload plugin "${pluginId}":`, error);
      return false;
    }
  }
  
  // Get a loaded plugin instance
  function get(pluginId) {
    return plugins.get(pluginId) || null;
  }
  
  // Get all loaded plugins
  function getAll() {
    return Array.from(plugins.values());
  }
  
  // Check if plugin is loaded
  function isLoaded(pluginId) {
    return plugins.has(pluginId);
  }
  
  // Register a hook
  function on(hookName, callback) {
    if (!hooks[hookName]) {
      throw new Error(`Unknown hook: ${hookName}. Available: ${Object.keys(hooks).join(', ')}`);
    }
    hooks[hookName].push(callback);
    return () => {
      const index = hooks[hookName].indexOf(callback);
      if (index > -1) hooks[hookName].splice(index, 1);
    };
  }
  
  // Trigger hooks
  function triggerHook(hookName, data) {
    if (!hooks[hookName]) return;
    hooks[hookName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[PluginSystem] Hook "${hookName}" error:`, error);
      }
    });
  }
  
  // Auto-load plugins from registry
  async function autoLoad() {
    if (!CONFIG.PLUGIN.AUTO_LOAD) return;
    
    const loadPromises = [];
    pluginRegistry.forEach((PluginClass, pluginId) => {
      try {
        loadPromises.push(load(pluginId).catch(err => {
          console.warn(`[PluginSystem] Auto-load failed for ${pluginId}:`, err.message);
        }));
      } catch (e) {
        console.warn(`[PluginSystem] Auto-load error for ${pluginId}:`, e);
      }
    });
    
    await Promise.allSettled(loadPromises);
  }
  
  // Render all active plugins to their containers
  function renderAll() {
    triggerHook('beforeRender', {});
    
    plugins.forEach((plugin, pluginId) => {
      if (!plugin.state.active) return;
      
      const container = document.getElementById(`plugin-${pluginId}`);
      if (container) {
        try {
          safeDOM.clear(container);
          const frag = document.createDocumentFragment();
          plugin.render(frag);
          container.appendChild(frag);
        } catch (error) {
          console.error(`[PluginSystem] Render failed for ${pluginId}:`, error);
          plugin.state.error = error.message;
          triggerHook('onError', { plugin, error });
        }
      }
    });
    
    triggerHook('afterRender', {});
  }
  
  // Update plugins with new data
  function updateAll(data) {
    plugins.forEach((plugin) => {
      if (!plugin.state.active) return;
      try {
        plugin.update(data);
      } catch (error) {
        console.error(`[PluginSystem] Update failed for ${plugin.id}:`, error);
      }
    });
  }
  
  // Export public API
  return {
    BasePlugin,
    register,
    load,
    unload,
    get,
    getAll,
    isLoaded,
    on,
    triggerHook,
    autoLoad,
    renderAll,
    updateAll,
    createPluginAPI,
    size: () => plugins.size
  };
})();

// ── EVENT DELEGATION ─────────────────────────────────────
document.addEventListener('click', function(e) {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  
  const action = actionEl.getAttribute('data-action');
  if (!action) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  try {
    // Parse action string like "setPalette(this)" or "setQ(this,'bad')"
    const match = action.match(/^(\w+)\((.*)\)$/);
    if (match) {
      const fnName = match[1];
      const argsStr = match[2];
      
      // Handle 'this' argument
      let args = [];
      if (argsStr.trim()) {
        const argParts = argsStr.split(',');
        for (let part of argParts) {
          part = part.trim();
          if (part === 'this') {
            args.push(actionEl);
          } else if (part.startsWith("'") && part.endsWith("'")) {
            args.push(part.slice(1, -1));
          } else if (part.startsWith('"') && part.endsWith('"')) {
            args.push(part.slice(1, -1));
          } else {
            // Try to evaluate as literal
            try {
              args.push(JSON.parse(part));
            } catch {
              args.push(part);
            }
          }
        }
      }
      
      // Call the function if it exists
      if (typeof window[fnName] === 'function') {
        window[fnName](...args);
      } else {
        console.warn('Function not found:', fnName);
      }
    }
  } catch (err) {
    console.error('Error executing action:', action, err);
  }
});

// Input/change event delegation for medical calculators and Black-Scholes
document.addEventListener('input', function(e) {
  const inputEl = e.target.closest('[data-action-input="true"]');
  if (!inputEl) return;
  
  try {
    const id = inputEl.id;
    
    // Medical calculator inputs
    if (id.startsWith('egfr-')) mCalcEGFR();
    else if (id.startsWith('cg-')) mCalcCG();
    else if (id.startsWith('bmi-')) mCalcBMI();
    else if (id.startsWith('map-')) mCalcMAP();
    else if (id.startsWith('ag-')) mCalcAG();
    else if (id.startsWith('ca-')) mCalcCa();
    else if (id.startsWith('abcd-age') || id.startsWith('abcd-bp') || id.startsWith('abcd-clin') || id.startsWith('abcd-dur')) mCalcABCD2();
    else if (id.startsWith('qtc-')) mCalcQTc();
    else if (id.startsWith('meld-')) mCalcMELD();
    else if (id.startsWith('hh-')) mCalcHH();
    else if (id.startsWith('dose-')) mCalcDose();
    else if (id.startsWith('bs-')) updateBS();
  } catch (err) {
    console.error('Error handling input:', id, err);
  }
});

document.addEventListener('change', function(e) {
  const changeEl = e.target.closest('[data-action-change="true"]');
  if (!changeEl) return;
  
  try {
    const id = changeEl.id;
    
    // Medical calculator selects and checkboxes
    if (id.startsWith('egfr-')) mCalcEGFR();
    else if (id.startsWith('cg-')) mCalcCG();
    else if (id.startsWith('ch-')) mCalcCHADS();
    else if (id.startsWith('gcs-')) mCalcGCS();
    else if (id.startsWith('curb-')) mCalcCURB();
    else if (id.startsWith('dvt-')) mCalcWells();
    else if (id.startsWith('pe-')) mCalcWellsPE();
    else if (id.startsWith('perc-')) mCalcPERC();
    else if (id.startsWith('centor-')) mCalcCentor();
    else if (id.startsWith('abcd-diab')) mCalcABCD2();
    else if (id.startsWith('nihss-')) mCalcNIHSS();
    else if (id.startsWith('sofa-')) mCalcSOFA();
    else if (id.startsWith('qsofa-')) mCalcQSOFA();
    else if (id.startsWith('news-')) mCalcNEWS();
    else if (id.startsWith('meld-')) mCalcMELD();
    else if (id === 'bmi-wt' || id === 'bmi-ht') mCalcBMI();
    else if (id === 'map-sys' || id === 'map-dia') mCalcMAP();
    else if (id === 'ag-na' || id === 'ag-cl' || id === 'ag-hco3') mCalcAG();
    else if (id === 'ca-total' || id === 'ca-alb') mCalcCa();
    else if (id.startsWith('bs-')) updateBS();
  } catch (err) {
    console.error('Error handling change:', id, err);
  }
});

// Keyboard navigation handler
document.addEventListener('keydown', function(e) {
  // Escape key handling
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('[role="dialog"]:not(.hidden)');
    if (activeModal) {
      activeModal.classList.add('hidden');
      a11y.announce('Modal closed');
    }
  }
  
  // Enter key on custom buttons
  if (e.key === 'Enter' && e.target.matches('[role="button"]')) {
    e.target.click();
  }
});

const DEFAULT_STATE={
  palette:'reaktor',theme:'dark',sleepQuality:'med',
  sleep:{start:null,stop:null,total:null},
  feelings:[],
  feelingOptions:['skupiony','zmęczony','spokojny','zmotywowany','niespokojny','zirytowany','smutny','w przepływie','przytłoczony','optymistyczny','wypalony','uważny','analityczny','niestabilny'],
  todos:[],habits:[],notes:'',
  nootropics:[],refills:[],
  stocks:[
    {tk:'NVDA',n:'NVIDIA Corp',p:'--',c:'--',up:false},
    {tk:'TSLA',n:'Tesla Inc',p:'--',c:'--',up:false},
    {tk:'AAPL',n:'Apple Inc',p:'--',c:'--',up:false},
    {tk:'SPY',n:'S&P 500 ETF',p:'--',c:'--',up:false},
    {tk:'AMD',n:'AMD Inc',p:'--',c:'--',up:false},
    {tk:'BTC',n:'Bitcoin / USD',p:'--',c:'--',up:false}
  ],
  timer:{presetIndex:0,presets:[{work:25,break:5,label:'25 / 5'},{work:50,break:10,label:'50 / 10'},{work:90,break:15,label:'90 / 15'}],running:false,remaining:1500,total:1500,session:1,lastTick:null},
  weather:null,calendarEvents:[],
  nootropicLog:{},sleepLog:{},archivedTodos:[],
  eventStore:{version:1,sheets:{sleep:[],habits:[],nootropics:[],todos:[],timer:[],weather:[],mood:[]}},
  holidays:[],mergedCalEvents:[],mdPreview:false,
  pizzaIndex:[{city:'Warszawa',price:32},{city:'Kraków',price:30},{city:'Szczecin',price:28},{city:'Gdańsk',price:31}]
};
let state=(typeof structuredClone==='function')?structuredClone(DEFAULT_STATE):JSON.parse(JSON.stringify(DEFAULT_STATE));
function deepMerge(target,source){for(const key in source){if(source[key]&&typeof source[key]==='object'&&!Array.isArray(source[key])){if(!target[key]||typeof target[key]!=='object'||Array.isArray(target[key])) target[key]={};deepMerge(target[key],source[key]);}else{target[key]=source[key];}}return target;}
// ═══════════════════════════════════════════════════
// STATE MANAGEMENT WITH DEBOUNCING & VERSIONING
// ═══════════════════════════════════════════════════
const StorageManager = {
  version: CONFIG.APP.STORAGE_VERSION || 1,
  debounceTimers: {},
  
  saveWithDebounce: function(key, data, delay = 500) {
    const storageKey = CONFIG.APP.STORAGE_PREFIX + key;
    if (this.debounceTimers[key]) clearTimeout(this.debounceTimers[key]);
    this.debounceTimers[key] = setTimeout(() => {
      try {
        const payload = { version: this.version, timestamp: Date.now(), data: data };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        if (error.name === 'QuotaExceededError') this.handleQuotaExceeded();
        console.error('[StorageManager] Save failed:', error.message);
      }
    }, delay);
  },
  
  loadWithVersion: function(key, defaultValue = null) {
    const storageKey = CONFIG.APP.STORAGE_PREFIX + key;
    try {
      const item = localStorage.getItem(storageKey);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      if (parsed.version && parsed.version !== this.version) {
        console.warn('[StorageManager] Version mismatch for', key);
      }
      return parsed.data !== undefined ? parsed.data : parsed;
    } catch (error) {
      console.error('[StorageManager] Load failed:', error.message);
      return defaultValue;
    }
  },
  
  handleQuotaExceeded: function() {
    try {
      const now = Date.now(), oneWeekAgo = now - 604800000;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CONFIG.APP.STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.timestamp && item.timestamp < oneWeekAgo) {
              localStorage.removeItem(key);
            }
          } catch (e) {}
        }
      });
    } catch (error) {
      console.error('[StorageManager] Cleanup failed:', error.message);
    }
  },
  
  clearAllDebounceTimers: function() {
    Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
    this.debounceTimers = {};
  }
};

function saveTodos(){ StorageManager.saveWithDebounce('todos', state.todos, 500); }
function saveFeelings(){ 
  const arr = [...document.querySelectorAll('.fc.sel')].map(x => x.textContent);
  StorageManager.saveWithDebounce('feelings', arr, 500);
}
function savePalette(){ 
  StorageManager.saveWithDebounce('palette', document.documentElement.getAttribute('data-palette'), 300);
}
function saveTheme(){ 
  StorageManager.saveWithDebounce('theme', document.documentElement.getAttribute('data-theme'), 300);
}
function saveTimer(){
  StorageManager.saveWithDebounce('timer', {
    presetIndex: state.timer.presetIndex,
    remaining: state.timer.remaining,
    sessions: state.timer.session
  }, 1000);
}
function saveHabits(){ StorageManager.saveWithDebounce('habits', state.habits, 500); }
function saveNootropics(){ StorageManager.saveWithDebounce('nootropics', state.nootropics, 500); }

function setPalette(el){
  savePalette();document.querySelectorAll('.pal-swatch').forEach(s=>s.classList.remove('active'));el.classList.add('active');state.palette=el.dataset.p;document.documentElement.setAttribute('data-palette',state.palette);}
(function(){
  const btn=document.querySelector('[data-theme-toggle]');
  const r=document.documentElement;
  if(!btn) return;
  
  function setThemeIcon(theme){
    safeDOM.clear(btn);
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('width','15');
    svg.setAttribute('height','15');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','2');
    
    if(theme==='dark'){
      // Moon icon
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d','M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
      svg.appendChild(path);
    }else{
      // Sun icon
      const circle=document.createElementNS(ns,'circle');
      circle.setAttribute('cx','12');
      circle.setAttribute('cy','12');
      circle.setAttribute('r','5');
      svg.appendChild(circle);
      const rays=document.createElementNS(ns,'path');
      rays.setAttribute('d','M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42');
      svg.appendChild(rays);
    }
    btn.appendChild(svg);
  }
  
  btn.addEventListener('click',()=>{
    state.theme=state.theme==='dark'?'light':'dark';
    r.setAttribute('data-theme',state.theme);
    setThemeIcon(state.theme);
  });
  
  // Initialize icon on load
  setThemeIcon(state.theme);
})();
let midnightResetDone=false;
function tick(){const n=new Date();const h=s=>String(s).padStart(2,'0');const hours=n.getHours(),minutes=n.getMinutes(),seconds=n.getSeconds();document.getElementById('ltime').textContent=`${h(hours)}:${h(minutes)}:${h(seconds)}`;const ny=new Date(n.getTime()+n.getTimezoneOffset()*60000-4*3600000);document.getElementById('ntime').textContent=`${h(ny.getHours())}:${h(ny.getMinutes())}:${h(ny.getSeconds())}`;const wd=ny.getDay(),hh=ny.getHours(),mm=ny.getMinutes();const open=wd>=1&&wd<=5&&(hh>9||(hh===9&&mm>=30))&&hh<16;document.getElementById('mdot').className='mkt-dot '+(open?'open':'closed');document.getElementById('mlabel').textContent=open?'OTWARTY':'ZAMKNIĘTY';document.getElementById('mlabel').style.color=open?'var(--nom)':'var(--txm)';const days=['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];const months=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];document.getElementById('cdate').textContent=`${days[n.getDay()]}, ${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()}`;if(hours===0&&minutes===0&&seconds===0&&!midnightResetDone){state.nootropics.forEach(nr=>{if(nr.status==='taken')nr.status='pending';});renderNoots();saveNootropics();state.habits.forEach(hb=>{hb.d.push(0);if(hb.d.length>14)hb.d.shift();let sk=0;for(let j=hb.d.length-1;j>=0;j--){if(hb.d[j])sk++;else break;}hb.s=sk;hb.lastDate=n.toISOString().slice(0,10);});renderHabits();saveHabits();midnightResetDone=true;}if(seconds>0){midnightResetDone=false;}updateProgressBars();} setInterval(tick,1000);tick();
function renderCalendar(){const n=new Date(),yr=n.getFullYear(),mo=n.getMonth();const mns=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];document.getElementById('calhdr').textContent=`${mns[mo]} ${yr}`;const g=document.getElementById('calgrid');safeDOM.clear(g);['Pn','Wt','Śr','Cz','Pt','So','Nd'].forEach(d=>{const e=document.createElement('div');e.className='cdl';e.textContent=d;g.appendChild(e);});let fd=new Date(yr,mo,1).getDay();fd=fd===0?6:fd-1;const dm=new Date(yr,mo+1,0).getDate(),pm=new Date(yr,mo,0).getDate();const evtMap={};const allEvts=[...(state.calendarEvents||[]).map(e=>({...e,source:'local'})),...(state.mergedCalEvents||[]),...(state.holidays||[]).map(h=>({title:h.title||h.localName,date:h.date,source:'holiday'}))];allEvts.forEach(ev=>{const ds=ev.date?ev.date.slice(0,10):null;if(!ds)return;const d=new Date(ds);if(d.getMonth()===mo&&d.getFullYear()===yr){const dd=d.getDate();if(!evtMap[dd])evtMap[dd]=[];evtMap[dd].push(ev);}});let day=1,nxt=1;for(let i=0;i<6*7;i++){const e=document.createElement('div');if(i<fd){e.className='cd other';e.textContent=pm-fd+i+1;}else if(day<=dm){const evts=evtMap[day]||[];const hasEvt=evts.length>0;const isHoliday=evts.some(x=>x.source==='holiday');e.className='cd'+(day===n.getDate()?' today':'')+(hasEvt?' evt':'')+(isHoliday?' holiday':'');e.textContent=day;if(hasEvt)e.title=evts.map(x=>x.title).join(', ');const dayNum=day;const yr_str=yr;const mo_str=String(mo+1).padStart(2,'0');const dy_str=String(dayNum).padStart(2,'0');e.style.cursor='pointer';e.addEventListener('click',()=>openCalModal(`${yr_str}-${mo_str}-${dy_str}`));day++;}else{e.className='cd other';e.textContent=nxt++;}g.appendChild(e);if(day>dm&&i>fd+dm-2&&(i+1)%7===0)break;}}
function addCalendarEvent(){openCalModal();}
function openCalModal(dateStr){const m=document.getElementById('cal-modal');m.style.display='flex';m.onclick=function(e){if(e.target===this)closeCalModal();};if(dateStr)document.getElementById('cal-evt-date').value=dateStr;document.getElementById('cal-evt-title').focus();}
function closeCalModal(){document.getElementById('cal-modal').style.display='none';document.getElementById('cal-evt-title').value='';document.getElementById('cal-evt-date').value='';document.getElementById('cal-evt-time').value='';document.getElementById('cal-evt-desc').value='';}
function saveCalEvent(){const title=document.getElementById('cal-evt-title').value.trim();const date=document.getElementById('cal-evt-date').value;const time=document.getElementById('cal-evt-time').value;const desc=document.getElementById('cal-evt-desc').value.trim();if(!title||!date){alert('Podaj tytuł i datę.');return;}if(!state.calendarEvents)state.calendarEvents=[];state.calendarEvents.push({title:sanitize.trim(title),date,time:time||null,desc:desc||null});StorageManager.saveWithDebounce('calendarEvents',state.calendarEvents);renderCalendar();closeCalModal();}
function renderFeelings(){const wrap=document.getElementById('feel-wrap');safeDOM.clear(wrap);state.feelingOptions.forEach(name=>{const btn=document.createElement('button');btn.className='fc'+(state.feelings.includes(name)?' sel':'');btn.textContent=name;btn.setAttribute('aria-pressed', state.feelings.includes(name) ? 'true' : 'false');btn.addEventListener('click', ()=>togF(name));wrap.appendChild(btn);});document.getElementById('fcnt').textContent=state.feelings.length+' '+(state.feelings.length===1?'wybrany':'wybrane');}
function togF(name){if(state.feelings.includes(name)) state.feelings=state.feelings.filter(x=>x!==name); else state.feelings.push(name); renderFeelings();}
function renderNoots(){const c=document.getElementById('noot-list');safeDOM.clear(c);if(!state.nootropics.length){const e=document.createElement('div');e.style.cssText='padding:.75rem;color:var(--txm);font-size:clamp(.6rem,.58rem+.12vw,.72rem);';e.textContent='Brak nootropików. Kliknij ✏️ aby dodać stack.';c.appendChild(e);return;}const today=new Date().toISOString().slice(0,10);const log=state.nootropicLog[today]||{};state.nootropics.forEach((n,idx)=>{const status=log[n.name]||'pending';const d=document.createElement('div');d.className='ni';d.style.cursor='pointer';d.addEventListener('click',()=>{if(!state.nootropicLog[today])state.nootropicLog[today]={};const cur=state.nootropicLog[today][n.name];state.nootropicLog[today][n.name]=cur==='taken'?'pending':'taken';StorageManager.saveWithDebounce('nootropicLog',state.nootropicLog);logEvent('nootropics',{date:today,name:n.name,status:state.nootropicLog[today][n.name]});renderNoots();});const statusDiv=document.createElement('div');statusDiv.className='nd '+sanitize.attribute(status);const nameSpan=document.createElement('span');nameSpan.className='nn';nameSpan.textContent=n.name;const doseSpan=document.createElement('span');doseSpan.className='ndose';doseSpan.textContent=n.dose;d.appendChild(statusDiv);d.appendChild(nameSpan);d.appendChild(doseSpan);c.appendChild(d);});}
function openNootEditor(){const m=document.getElementById('noot-editor-modal');if(!m)return;m.style.display='flex';renderNootEditorList();}
function closeNootEditor(){document.getElementById('noot-editor-modal').style.display='none';}
function renderNootEditorList(){const c=document.getElementById('noot-editor-list');safeDOM.clear(c);state.nootropics.forEach((n,i)=>{const r=document.createElement('div');r.style.cssText='display:flex;gap:.5rem;align-items:center;margin-bottom:.375rem;';const ni=document.createElement('input');ni.className='cinp';ni.style.cssText='flex:1;width:auto;';ni.value=n.name;ni.placeholder='Nazwa';const di=document.createElement('input');di.className='cinp';di.style.cssText='width:100px;';di.value=n.dose;di.placeholder='Dawka';const del=document.createElement('button');del.className='btn-sec';del.style.cssText='padding:2px 6px;font-size:.7rem;';del.textContent='×';del.onclick=()=>{state.nootropics.splice(i,1);saveNootropics();renderNootEditorList();};ni.onchange=()=>{state.nootropics[i].name=ni.value;};di.onchange=()=>{state.nootropics[i].dose=di.value;};r.appendChild(ni);r.appendChild(di);r.appendChild(del);c.appendChild(r);});}
function addNootEntry(){state.nootropics.push({name:'Nowy',dose:'',status:'pending'});renderNootEditorList();}
function saveNootEditor(){saveNootropics();renderNoots();closeNootEditor();}
function renderHabits(){const c=document.getElementById('hlist');safeDOM.clear(c);if(!state.habits.length){const e=document.createElement('div');e.style.cssText='padding:.75rem;color:var(--txm);font-size:clamp(.6rem,.58rem+.12vw,.72rem);';e.textContent='Brak nawyków. Dodaj nowy nawyk.';c.appendChild(e);return;}state.habits.forEach((h,idx)=>{const r=document.createElement('div');r.className='hr';const nm=document.createElement('span');nm.className='hn';nm.textContent=h.n;const dd=document.createElement('div');dd.className='hd';h.d.forEach((v,i)=>{const d=document.createElement('div');d.className='dot'+(v?' done':'')+(i===h.d.length-1?' cur':'');d.setAttribute('role','button');d.setAttribute('tabindex','0');d.setAttribute('aria-pressed',v?'true':'false');d.addEventListener('click',()=>{state.habits[idx].d[i]=state.habits[idx].d[i]?0:1;let sk=0;for(let j=state.habits[idx].d.length-1;j>=0;j--){if(state.habits[idx].d[j])sk++;else break;}state.habits[idx].s=sk;renderHabits();saveHabits();});d.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){state.habits[idx].d[i]=state.habits[idx].d[i]?0:1;let sk=0;for(let j=state.habits[idx].d.length-1;j>=0;j--){if(state.habits[idx].d[j])sk++;else break;}state.habits[idx].s=sk;renderHabits();saveHabits();}});dd.appendChild(d);});const st=document.createElement('span');st.className='hstr mono';st.textContent=h.s+'d';r.append(nm,dd,st);c.appendChild(r);});}
function renderTodos(){
  const c=document.getElementById('tlist');
  safeDOM.clear(c);
  if(!state.todos.length){const e=document.createElement('div');e.style.cssText='padding:.75rem;color:var(--txm);font-size:clamp(.6rem,.58rem+.12vw,.72rem);';e.textContent='Brak zadań. Dodaj nowe zadanie.';c.appendChild(e);document.getElementById('tdh').textContent='0 / 0';return;}
  state.todos.forEach((t,i)=>{
    const r=document.createElement('div');
    r.className='ti';
    const cb=document.createElement('div');
    cb.className='tc'+(t.done?' done':'');
    cb.setAttribute('role', 'button');
    cb.setAttribute('tabindex', '0');
    cb.setAttribute('aria-pressed', t.done ? 'true' : 'false');
    cb.addEventListener('click', ()=>togTodo(i));
    cb.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' ')togTodo(i);});
    const txt=document.createElement('span');
    txt.className='tt'+(t.done?' done':'');
    txt.textContent=t.t;
    const pri=document.createElement('span');
    pri.className='tp '+t.p;
    pri.textContent=t.p;
    r.appendChild(cb);
    r.appendChild(txt);
    r.appendChild(pri);
    c.appendChild(r);
  });
  const d=state.todos.filter(x=>x.done).length;
  document.getElementById('tdh').textContent=`${d} / ${state.todos.length}`;
}

function togTodo(i){
  state.todos[i].done=!state.todos[i].done;
  renderTodos();
  saveTodos();
  a11y.announce(state.todos[i].done ? 'Zadanie wykonane' : 'Zadanie nieukończone');
}

function addTodo(){
  const inp=document.getElementById('tinp');
  const text = sanitize.trim(inp.value);
  if(!validate.todoText(text)) {
    a11y.announce('Wprowadź tekst zadania');
    return;
  }
  state.todos.unshift({t:text,done:false,p:'M'});
  inp.value='';
  renderTodos();
  saveTodos();
  a11y.announce('Dodano nowe zadanie');
}

document.getElementById('tinp').addEventListener('keydown',e=>{
  if(e.key==='Enter')addTodo();
});
function archiveDone(){const done=state.todos.filter(t=>t.done);const pending=state.todos.filter(t=>!t.done);state.archivedTodos=[...(state.archivedTodos||[]),...done.map(t=>({...t,archivedAt:new Date().toISOString()}))];state.todos=pending;renderTodos();saveTodos();StorageManager.saveWithDebounce('archivedTodos',state.archivedTodos);a11y.announce('Zarchiwizowano ukończone zadania');}
function showArchive(){const m=document.getElementById('archive-modal');if(!m)return;m.style.display='flex';const c=document.getElementById('archive-list');safeDOM.clear(c);const arr=state.archivedTodos||[];if(!arr.length){c.textContent='Brak archiwalnych zadań.';return;}arr.slice().reverse().forEach(t=>{const r=document.createElement('div');r.style.cssText='display:flex;justify-content:space-between;padding:.375rem 0;border-bottom:1px solid var(--div);font-size:clamp(.6rem,.58rem+.12vw,.72rem);';const s=document.createElement('span');s.textContent=t.t;s.style.cssText='color:var(--txm);text-decoration:line-through;';const d=document.createElement('span');d.className='mono';d.style.cssText='color:var(--txf);font-size:.6rem;';d.textContent=t.archivedAt?new Date(t.archivedAt).toLocaleDateString('pl-PL'):'';r.appendChild(s);r.appendChild(d);c.appendChild(r);});}
function closeArchive(){document.getElementById('archive-modal').style.display='none';}

function renderRefills(){
  const c=document.getElementById('refill-list');
  if(!c) return;
  const frag=document.createDocumentFragment();
  state.refills.forEach(r=>{
    const d=document.createElement('div');
    d.className='ri'+(r.critical?' crit':'');
    const nameSpan=document.createElement('span');
    nameSpan.className='rn';
    nameSpan.textContent=r.name;
    const barWrap=document.createElement('div');
    barWrap.className='rbw';
    const bar=document.createElement('div');
    bar.className='rb';
    bar.style.width=r.pct+'%';
    bar.style.background=r.color;
    barWrap.appendChild(bar);
    const daysSpan=document.createElement('span');
    daysSpan.className='rd'+(r.critical?' crit':'')+' mono';
    daysSpan.textContent=r.days;
    d.appendChild(nameSpan);
    d.appendChild(barWrap);
    d.appendChild(daysSpan);
    frag.appendChild(d);
  });
  safeDOM.clear(c);
  c.appendChild(frag);
}
const NEWS=[{t:'08:41',h:'Fed utrzymuje stopy — rynki reagują spokojnie',s:'Reuters',c:'fin'},{t:'08:22',h:'WHO: Nowe wytyczne leczenia opornej gruźlicy płuc',s:'WHO',c:'med'},{t:'07:55',h:'GPW: WIG20 otworzył się wzrostem 0.4%',s:'Parkiet',c:'fin'},{t:'07:33',h:'Trump ogłasza nowe cła na elektronikę z Azji',s:'Bloomberg',c:'pol'},{t:'07:14',h:'Meta zapowiada AI do analizy obrazów MRI',s:'TechCrunch',c:'tch'},{t:'06:58',h:'NBP: Inflacja w Polsce spada do 3.2% r/r',s:'NBP',c:'fin'},{t:'06:40',h:'Niedobór snu zwiększa ryzyko cukrzycy T2 o 27%',s:'NEJM',c:'med'},{t:'06:21',h:'NVIDIA Blackwell Ultra — +60% wydajność AI',s:'The Verge',c:'tch'},{t:'05:58',h:'Sejm: Reforma ochrony zdrowia przełożona na wrzesień',s:'PAP',c:'pol'},{t:'05:33',h:'Ropa WTI spada poniżej $78 — obawy o popyt',s:'Bloomberg',c:'fin'}];
function renderNews(){
  const panes={all:[],fin:[],med:[],pol:[],tch:[]};
  NEWS.forEach(n=>{
    const item=document.createElement('div');
    item.className='nit';
    const timeSpan=document.createElement('span');
    timeSpan.className='ntm mono';
    timeSpan.textContent=n.t;
    const contentDiv=document.createElement('div');
    const headline=document.createElement('div');
    headline.className='nh';
    headline.textContent=n.h;
    const source=document.createElement('div');
    source.className='ns';
    source.textContent=n.s;
    contentDiv.appendChild(headline);
    contentDiv.appendChild(source);
    item.appendChild(timeSpan);
    item.appendChild(contentDiv);
    panes.all.push(item);
    if(!panes[n.c]) panes[n.c]=[];
    panes[n.c].push(item);
  });
  Object.entries(panes).forEach(([k,items])=>{
    const container=document.getElementById('np-'+k);
    if(container){
      safeDOM.clear(container);
      const frag=document.createDocumentFragment();
      items.forEach(item=>frag.appendChild(item.cloneNode(true)));
      container.appendChild(frag);
    }
  });
}

function switchN(tab,key){
  document.querySelectorAll('.ntab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.np').forEach(p=>p.classList.remove('active'));
  tab.classList.add('active');
  const target=document.getElementById('np-'+key);
  if(target) target.classList.add('active');
}
function setQ(el,q){document.querySelectorAll('.qb').forEach(b=>b.classList.remove('active','bad','med','good'));el.classList.add('active',q);state.sleepQuality=q;document.getElementById('sw').className='w c4'+(q==='bad'?' critical':'');const today=new Date().toISOString().slice(0,10);if(!state.sleepLog[today])state.sleepLog[today]={};state.sleepLog[today].quality=q;StorageManager.saveWithDebounce('sleepLog',state.sleepLog);logEvent('sleep',{date:today,quality:q});}
function calcSleepTotal(start,stop){if(!start||!stop)return null;const[sh,sm]=start.split(':').map(Number);const[eh,em]=stop.split(':').map(Number);let mins=(eh*60+em)-(sh*60+sm);if(mins<0)mins+=24*60;const h=Math.floor(mins/60),m=mins%60;return`${h}h ${String(m).padStart(2,'0')}m`;}
function editSleepField(id,field){const el=document.getElementById(id);if(el.querySelector('input'))return;const cur=state.sleep[field]||'';const inp=document.createElement('input');inp.type='time';inp.value=cur||'';inp.className='cinp mono';inp.style.cssText='width:100%;font-size:inherit;';el.textContent='';el.appendChild(inp);inp.focus();const save=()=>{const v=inp.value;if(v){state.sleep[field]=v;state.sleep.total=calcSleepTotal(state.sleep.start,state.sleep.stop);const today=new Date().toISOString().slice(0,10);if(!state.sleepLog[today])state.sleepLog[today]={};state.sleepLog[today][field]=v;if(state.sleep.total)state.sleepLog[today].total=state.sleep.total;StorageManager.saveWithDebounce('sleepLog',state.sleepLog);}renderSleep();};inp.addEventListener('blur',save);inp.addEventListener('keydown',e=>{if(e.key==='Enter')save();});}
function renderSleep(){const ss=document.getElementById('sleep-start');const se=document.getElementById('sleep-stop');const st=document.getElementById('sleep-total');if(ss){ss.textContent=state.sleep.start||'--:--';ss.style.cursor='pointer';ss.onclick=()=>editSleepField('sleep-start','start');}if(se){se.textContent=state.sleep.stop||'--:--';se.style.cursor='pointer';se.onclick=()=>editSleepField('sleep-stop','stop');}if(st)st.textContent=state.sleep.total||'--';document.querySelectorAll('.qb').forEach(b=>b.classList.remove('active','bad','med','good'));const active=document.querySelector('.qb.'+state.sleepQuality)||document.querySelectorAll('.qb')[1];if(active)active.classList.add('active',state.sleepQuality);document.getElementById('sw').className='w c4'+(state.sleepQuality==='bad'?' critical':'');}
function applyPrefs(){document.documentElement.setAttribute('data-palette',state.palette);document.documentElement.setAttribute('data-theme',state.theme);document.querySelectorAll('.pal-swatch').forEach(s=>s.classList.toggle('active',s.dataset.p===state.palette));}
function exportState(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='life-os-state.json';a.click();URL.revokeObjectURL(a.href);} function downloadTemplate(){const blob=new Blob([JSON.stringify(DEFAULT_STATE,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='life-os-template.json';a.click();URL.revokeObjectURL(a.href);} document.getElementById('import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file) return;try{const text=await file.text();const imported=JSON.parse(text);const cloneFn=(typeof structuredClone==='function')?structuredClone:(x)=>JSON.parse(JSON.stringify(x));state=deepMerge(cloneFn(DEFAULT_STATE),imported);hydrate();}catch(err){alert('Nie udało się wczytać pliku JSON.');}e.target.value='';});
async function fetchWeather(){
  const url=`${CONFIG.WEATHER_API.BASE_URL}/forecast?latitude=${CONFIG.WEATHER_API.LATITUDE}&longitude=${CONFIG.WEATHER_API.LONGITUDE}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${CONFIG.WEATHER_API.TIMEZONE}&forecast_days=5`;
  try{
    const res=await safeFetch(url, {}, null);
    if(!res) throw new Error('weather');
    state.weather=res;
    renderWeather();
    a11y.announce('Pogoda zaktualizowana');
  }catch(err){
    document.getElementById('weather-code').textContent='Brak połączenia z Open-Meteo';
    console.error('Weather fetch failed:', err.message);
  }
}
function weatherLabel(code){const map={0:'Czyste niebo',1:'Przeważnie pogodnie',2:'Częściowe zachmurzenie',3:'Pochmurno',45:'Mgła',48:'Osadzająca mgła',51:'Mżawka słaba',53:'Mżawka umiarkowana',55:'Mżawka gęsta',61:'Deszcz słaby',63:'Deszcz umiarkowany',65:'Deszcz silny',71:'Śnieg słaby',73:'Śnieg umiarkowany',75:'Śnieg silny',80:'Przelotne opady słabe',81:'Przelotne opady umiarkowane',82:'Przelotne opady silne',95:'Burza'};return map[code]||('Kod '+code);} function weatherIcon(code){if([0,1].includes(code)) return '☀️';if([2].includes(code)) return '⛅';if([3,45,48].includes(code)) return '🌥';if([51,53,55,61,63,65,80,81,82].includes(code)) return '🌧';if([71,73,75].includes(code)) return '❄️';if([95].includes(code)) return '⛈';return '•';}
function renderWeather(){const w=state.weather;if(!w||!w.current) return;document.getElementById('weather-temp').textContent=Math.round(w.current.temperature_2m)+'°';document.getElementById('weather-code').textContent=weatherLabel(w.current.weather_code);document.getElementById('weather-feels').textContent='Odczuwalnie '+Math.round(w.current.apparent_temperature)+'°';document.getElementById('weather-wind').textContent='Wiatr '+Math.round(w.current.wind_speed_10m)+' km/h';document.getElementById('weather-humidity').textContent='Wilgotność '+Math.round(w.current.relative_humidity_2m)+'%';const t=new Date();document.getElementById('weather-updated').textContent='Aktualizacja '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');const wrap=document.getElementById('forecast-wrap');safeDOM.clear(wrap);const days=['ND','PN','WT','ŚR','CZW','PT','SB'];w.daily.time.forEach((d,i)=>{const el=document.createElement('div');el.className='wfd';const daySpan=document.createElement('span');daySpan.className='wfdl';daySpan.textContent=days[new Date(d).getDay()];const iconSpan=document.createElement('span');iconSpan.style.fontSize='.875rem';iconSpan.textContent=weatherIcon(w.daily.weather_code[i]);const tempSpan=document.createElement('span');tempSpan.className='wfdt mono';tempSpan.textContent=Math.round(w.daily.temperature_2m_max[i])+'° / '+Math.round(w.daily.temperature_2m_min[i])+'°';el.appendChild(daySpan);el.appendChild(iconSpan);el.appendChild(tempSpan);wrap.appendChild(el);});}
// Weather extended providers
async function fetchWeatherExtended(){
  // AQ from Open-Meteo
  try{const r=await safeFetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${CONFIG.LOCATION.LAT}&longitude=${CONFIG.LOCATION.LON}&current=pm2_5,pm10,uv_index`,{},null);if(r&&r.current){state.airQuality={pm25:r.current.pm2_5,pm10:r.current.pm10,uv:r.current.uv_index};renderAQBadge();}}catch(e){}
  // OpenUV
  if(CONFIG.OPENUV_KEY){try{const r=await safeFetch(`https://api.openuv.io/api/v1/uv?lat=${CONFIG.LOCATION.LAT}&lng=${CONFIG.LOCATION.LON}`,{headers:{'x-access-token':CONFIG.OPENUV_KEY}},null);if(r&&r.result){state.uvData={uv:r.result.uv,uvMax:r.result.uv_max};renderUVBadge();}}catch(e){}}
  // IMGW alerts
  try{const r=await safeFetch('https://danepubliczne.imgw.pl/api/data/warningsmeteo',{},null);if(r&&Array.isArray(r)){state.imgwAlerts=r.filter(a=>a.voivodeship&&/zachodniopomorskie/i.test(a.voivodeship));renderIMGWAlerts();}}catch(e){}
  // RainViewer
  try{const r=await safeFetch('https://api.rainviewer.com/public/weather-maps.json',{},null);if(r&&r.radar&&r.radar.past&&r.radar.past.length){state.radarData=r.radar.past[r.radar.past.length-1];}}catch(e){}
  checkWeatherAlerts();
}
function renderAQBadge(){const el=document.getElementById('aqi-badge');if(!el||!state.airQuality)return;const pm=state.airQuality.pm25;let cls='nom',txt='Dobra';if(pm>75){cls='az';txt='Zła';}else if(pm>35){cls='a2';txt='Umiarkowana';}else if(pm>12){cls='a1';txt='Akceptowalna';}el.textContent=`PM2.5: ${pm?.toFixed(0)||'--'} · ${txt}`;el.className='pill '+cls;el.style.display='inline-block';}
function renderUVBadge(){const el=document.getElementById('uv-badge');if(!el)return;const uv=state.uvData?.uv||state.airQuality?.uv;if(uv==null){el.style.display='none';return;}let icon='🟢',txt='Low';if(uv>=8){icon='🟣';txt='Extreme';}else if(uv>=6){icon='🔴';txt='Very High';}else if(uv>=3){icon='🟡';txt='Moderate';}el.textContent=`UV: ${uv.toFixed(1)} ${icon} ${txt}`;el.style.display='inline-block';}
function renderIMGWAlerts(){const el=document.getElementById('imgw-banner');if(!el)return;if(!state.imgwAlerts||!state.imgwAlerts.length){el.style.display='none';return;}el.style.display='block';el.textContent='⚠️ Alert IMGW: '+state.imgwAlerts.map(a=>a.description||a.phenomena||'Ostrzeżenie').join('; ');}
function checkWeatherAlerts(){const el=document.getElementById('weather-alerts-bar');if(!el)return;const alerts=[];const aq=state.airQuality;if(aq){if(aq.pm25>75)alerts.push(CONFIG.WEATHER_ALERTS.veryHighPM25.message);else if(aq.pm25>35)alerts.push(CONFIG.WEATHER_ALERTS.highPM25.message);const uv=aq.uv||(state.uvData&&state.uvData.uv);if(uv>=8)alerts.push(CONFIG.WEATHER_ALERTS.extremeUV.message);else if(uv>=6)alerts.push(CONFIG.WEATHER_ALERTS.highUV.message);}if(state.imgwAlerts&&state.imgwAlerts.length)alerts.push(CONFIG.WEATHER_ALERTS.imgwAlert.message);if(!alerts.length){el.style.display='none';return;}el.style.display='block';el.textContent=alerts.join(' | ');}
// Finance widgets
async function fetchPolymarket(){try{const res=await safeFetch('https://gamma-api.polymarket.com/events?limit=5&active=true&order=volume&ascending=false',{},null);if(!res||!Array.isArray(res))return[];return res.map(e=>({title:e.title,outcomes:e.markets?.slice(0,2).map(m=>({question:m.question,prices:m.outcomePrices}))}));}catch(e){return[];}}
async function fetchInsiders(){if(!CONFIG.FINNHUB_API_KEY&&!CONFIG.MARKET_NEWS.FINNHUB_API_KEY)return[];const key=CONFIG.FINNHUB_API_KEY||CONFIG.MARKET_NEWS.FINNHUB_API_KEY;const trades=[];for(const t of TICKERS.slice(0,4)){try{const r=await safeFetch(`https://finnhub.io/api/v1/stock/insider-transactions?symbol=${t.sym}&token=${key}`,{},null);if(r&&r.data)trades.push(...r.data.slice(0,3).map(tr=>({symbol:t.sym,name:tr.name,shares:tr.share,type:tr.transactionType,value:tr.transactionValue,date:tr.transactionDate})));}catch(e){}}return trades.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);}
async function fetchSECFilings(){if(!CONFIG.FINNHUB_API_KEY&&!CONFIG.MARKET_NEWS.FINNHUB_API_KEY)return[];const key=CONFIG.FINNHUB_API_KEY||CONFIG.MARKET_NEWS.FINNHUB_API_KEY;const filings=[];for(const t of TICKERS.slice(0,4)){try{const r=await safeFetch(`https://finnhub.io/api/v1/stock/filings?symbol=${t.sym}&token=${key}`,{},null);if(r&&Array.isArray(r))filings.push(...r.slice(0,3).map(f=>({symbol:t.sym,form:f.form,date:f.filedDate,url:f.reportUrl})));}catch(e){}}return filings.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);}
async function fetchTrumpNews(){const key=CONFIG.FINNHUB_API_KEY||CONFIG.MARKET_NEWS.FINNHUB_API_KEY;if(!key)return[];try{const to=new Date().toISOString().slice(0,10);const from=new Date(Date.now()-7*86400000).toISOString().slice(0,10);const r=await safeFetch(`https://finnhub.io/api/v1/news?category=general&from=${from}&to=${to}&token=${key}`,{},null);if(!r||!Array.isArray(r))return[];return r.filter(n=>/trump/i.test(n.headline)||/trump/i.test(n.summary)).slice(0,5);}catch(e){return[];}}
async function renderFinanceWidgets(){
  // Polymarket
  const pmEl=document.getElementById('polymarket-list');if(pmEl){safeDOM.clear(pmEl);pmEl.textContent='Ładowanie...';const events=await fetchPolymarket();safeDOM.clear(pmEl);if(!events.length){pmEl.textContent='Brak danych Polymarket.';} else{events.forEach(ev=>{const d=document.createElement('div');d.style.cssText='padding:.375rem 0;border-bottom:1px solid var(--div);';const t=document.createElement('div');t.style.cssText='font-size:.7rem;color:var(--tx);font-weight:500;';t.textContent=ev.title;d.appendChild(t);if(ev.outcomes){ev.outcomes.forEach(o=>{const s=document.createElement('div');s.style.cssText='font-size:.6rem;color:var(--txm);';s.textContent=(o.question||'')+' '+(o.prices||'');d.appendChild(s);});}pmEl.appendChild(d);});}}
  // Insiders
  const insEl=document.getElementById('insiders-list');if(insEl){safeDOM.clear(insEl);insEl.textContent='Ładowanie...';const trades=await fetchInsiders();safeDOM.clear(insEl);if(!trades.length){insEl.textContent='Brak danych insider.';} else{trades.forEach(tr=>{const d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:1px solid var(--soff);font-size:.6rem;';const l=document.createElement('span');l.textContent=`${tr.symbol} · ${(tr.name||'').slice(0,20)}`;l.style.color='var(--tx)';const r=document.createElement('span');r.className='mono';r.style.color=tr.type==='S'?'var(--az)':'var(--nom)';r.textContent=`${tr.type==='S'?'SELL':'BUY'} ${tr.shares||''}`;d.appendChild(l);d.appendChild(r);insEl.appendChild(d);});}}
  // SEC
  const secEl=document.getElementById('sec-list');if(secEl){safeDOM.clear(secEl);secEl.textContent='Ładowanie...';const filings=await fetchSECFilings();safeDOM.clear(secEl);if(!filings.length){secEl.textContent='Brak danych SEC.';} else{filings.forEach(f=>{const d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:1px solid var(--soff);font-size:.6rem;';const l=document.createElement('span');l.textContent=`${f.symbol} · ${f.form}`;l.style.color='var(--tx)';const r=document.createElement('span');r.className='mono';r.style.color='var(--txm)';r.textContent=f.date||'';d.appendChild(l);d.appendChild(r);secEl.appendChild(d);});}}
  // Pizza Index
  const piEl=document.getElementById('pizza-list');if(piEl){safeDOM.clear(piEl);(state.pizzaIndex||[]).forEach(p=>{const d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:1px solid var(--soff);font-size:.65rem;';const l=document.createElement('span');l.textContent=p.city;l.style.color='var(--tx)';const r=document.createElement('span');r.className='mono';r.style.color='var(--a1)';r.textContent=p.price+' PLN';d.appendChild(l);d.appendChild(r);piEl.appendChild(d);});}
  // Trump Tracker
  const ttEl=document.getElementById('trump-list');if(ttEl){safeDOM.clear(ttEl);ttEl.textContent='Ładowanie...';const news=await fetchTrumpNews();safeDOM.clear(ttEl);if(!news.length){ttEl.textContent='Brak newsów o Trump.';} else{news.forEach(n=>{const d=document.createElement('div');d.style.cssText='padding:.25rem 0;border-bottom:1px solid var(--soff);';const h=document.createElement('div');h.style.cssText='font-size:.6rem;color:var(--tx);';h.textContent=n.headline;const s=document.createElement('div');s.style.cssText='font-size:.55rem;color:var(--txm);';s.textContent=(n.source||'')+' · '+new Date(n.datetime*1000).toLocaleDateString('pl-PL');d.appendChild(h);d.appendChild(s);ttEl.appendChild(d);});}}
}
function fmtTime(sec){const m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
let timerInterval=null; function syncTimerUI(){const t=state.timer;document.getElementById('timer-screen').textContent=fmtTime(t.remaining);document.getElementById('timer-mode').textContent=fmtTime(t.remaining);document.getElementById('timer-session').textContent='sesja '+t.session;document.getElementById('timer-preset-label').textContent=t.presets[t.presetIndex].label;document.getElementById('timer-state').textContent=t.running?'w toku':'gotowy';document.getElementById('timer-state').className='pill '+(t.running?'a1':'');document.getElementById('timer-fill').style.width=((t.total-t.remaining)/t.total*100)+'%';}
function clearTimer(){if(timerInterval){clearInterval(timerInterval);timerInterval=null;}}
function startTimer(){if(state.timer.running) return;state.timer.running=true;state.timer.lastTick=Date.now();syncTimerUI();timerInterval=setInterval(()=>{const now=Date.now();const delta=Math.floor((now-state.timer.lastTick)/1000);if(delta>0){state.timer.lastTick=now;state.timer.remaining=Math.max(0,state.timer.remaining-delta);syncTimerUI();if(state.timer.remaining<=0){clearTimer();state.timer.running=false;document.getElementById('timer-state').textContent='koniec';document.getElementById('timer-state').className='pill az';}}},250);} function pauseTimer(){state.timer.running=false;clearTimer();syncTimerUI();} function resetTimer(){clearTimer();state.timer.running=false;const p=state.timer.presets[state.timer.presetIndex];state.timer.total=p.work*60;state.timer.remaining=state.timer.total;syncTimerUI();} function cyclePreset(){state.timer.presetIndex=(state.timer.presetIndex+1)%state.timer.presets.length;state.timer.session=1;resetTimer();}

// Cleanup all timers on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  clearTimer();
  StorageManager.clearAllDebounceTimers();
});

// Visibility API - pause timer when tab is hidden to save resources
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.timer.running) {
    // Timer will naturally drift but we correct on visibility change
    console.log('[Timer] Tab hidden, timer running in background');
  } else if (!document.hidden && state.timer.running) {
    // Recalculate remaining time to correct drift
    state.timer.lastTick = Date.now();
    syncTimerUI();
    console.log('[Timer] Tab visible, timer corrected');
  }
});

function hydrate(){
  applyPrefs();
  const safeRender = (name) => {
    try {
      const fn = window[name];
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.warn(`[hydrate] Skipped render ${name}:`, err);
    }
  };

  safeRender('renderCalendar');
  safeRender('renderFeelings');
  safeRender('renderNoots');
  safeRender('renderHabits');
  safeRender('renderTodos');
  safeRender('renderStocks');
  safeRender('renderRefills');
  safeRender('renderNews');
  safeRender('renderSleep');
  safeRender('renderAnalytics');
  document.getElementById('notes').value = state.notes || '';
  syncTimerUI();
  if (state.weather) safeRender('renderWeather');
  updateProgressBars();
}
document.getElementById('notes').addEventListener('input',e=>{state.notes=e.target.value;StorageManager.saveWithDebounce('notes',state.notes);});
// Markdown renderer
function renderMarkdown(text){return text.replace(/^### (.+)/gm,'<h3>$1</h3>').replace(/^## (.+)/gm,'<h2>$1</h2>').replace(/^# (.+)/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/^- (.+)/gm,'<li>$1</li>').replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>').replace(/\n/g,'<br>');}
function toggleMdPreview(){const ta=document.getElementById('notes');const pv=document.getElementById('notes-preview');const btn=document.getElementById('md-toggle');if(!pv)return;state.mdPreview=!state.mdPreview;if(state.mdPreview){ta.style.display='none';pv.style.display='block';pv.innerHTML=renderMarkdown(sanitize.html(state.notes||''));btn.textContent='✏️ Edycja';}else{ta.style.display='block';pv.style.display='none';btn.textContent='👁 Podgląd';}}
// Event Store
function logEvent(sheet,entry){if(!state.eventStore)state.eventStore={version:1,sheets:{}};if(!state.eventStore.sheets[sheet])state.eventStore.sheets[sheet]=[];state.eventStore.sheets[sheet].push({...entry,timestamp:new Date().toISOString()});if(state.eventStore.sheets[sheet].length>365)state.eventStore.sheets[sheet]=state.eventStore.sheets[sheet].slice(-365);StorageManager.saveWithDebounce('eventStore',state.eventStore);}
function showEventStore(){const m=document.getElementById('eventstore-modal');if(!m)return;m.style.display='flex';renderEventStoreSheet('sleep');}
function closeEventStore(){document.getElementById('eventstore-modal').style.display='none';}
function renderEventStoreSheet(sheet){const c=document.getElementById('es-content');safeDOM.clear(c);const data=(state.eventStore&&state.eventStore.sheets&&state.eventStore.sheets[sheet])||[];if(!data.length){c.textContent='Brak danych.';return;}const tbl=document.createElement('table');tbl.style.cssText='width:100%;border-collapse:collapse;font-size:.65rem;';const hdr=document.createElement('tr');const cols=data[0]?Object.keys(data[0]):[];cols.forEach(k=>{const th=document.createElement('th');th.style.cssText='text-align:left;padding:3px 6px;border-bottom:1px solid var(--div);color:var(--txm);';th.textContent=k;hdr.appendChild(th);});tbl.appendChild(hdr);data.slice(-50).reverse().forEach(row=>{const tr=document.createElement('tr');cols.forEach(k=>{const td=document.createElement('td');td.style.cssText='padding:2px 6px;border-bottom:1px solid var(--soff);color:var(--tx);';td.textContent=row[k]!=null?String(row[k]):'';tr.appendChild(td);});tbl.appendChild(tr);});c.appendChild(tbl);}
function exportESSheet(sheet){const data=(state.eventStore&&state.eventStore.sheets&&state.eventStore.sheets[sheet])||[];if(!data.length)return;const cols=Object.keys(data[0]);const csv=[cols.join(','),...data.map(r=>cols.map(c=>JSON.stringify(r[c]!=null?String(r[c]):'')).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`lifeos-${sheet}.csv`;a.click();URL.revokeObjectURL(a.href);}
// Google Calendar fetch
async function fetchGoogleCalEvents(){if(!CONFIG.GOOGLE_CAL.API_KEY)return[];try{const now=new Date(),ms=new Date(now.getFullYear(),now.getMonth(),1).toISOString(),me=new Date(now.getFullYear(),now.getMonth()+1,0).toISOString();const url=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CONFIG.GOOGLE_CAL.CALENDAR_ID)}/events?timeMin=${ms}&timeMax=${me}&singleEvents=true&orderBy=startTime&key=${CONFIG.GOOGLE_CAL.API_KEY}`;const res=await safeFetch(url,{},null);if(!res||!res.items)return[];return res.items.map(e=>({id:e.id,title:e.summary||'Bez tytułu',date:e.start.dateTime||e.start.date,end:e.end.dateTime||e.end.date,source:'google'}));}catch(e){return[];}}
// Nager.date holidays
async function fetchHolidays(year){try{const res=await safeFetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PL`,{},null);if(!res||!Array.isArray(res))return[];return res.map(h=>({title:h.localName,date:h.date,source:'holiday'}));}catch(e){return[];}}
async function loadAllCalendarEvents(){const googleEvts=await fetchGoogleCalEvents();const yr=new Date().getFullYear();const holidays=await fetchHolidays(yr);state.holidays=holidays;state.mergedCalEvents=googleEvts;renderCalendar();}
// Progress bars
function updateProgressBars(){const now=new Date();const dayPct=((now.getHours()*60+now.getMinutes())/1440*100).toFixed(1);const dow=now.getDay()===0?6:now.getDay()-1;const weekPct=((dow*1440+now.getHours()*60+now.getMinutes())/(7*1440)*100).toFixed(1);const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();const monthPct=((now.getDate()-1+(now.getHours()*60+now.getMinutes())/1440)/dim*100).toFixed(1);const soy=new Date(now.getFullYear(),0,1),eoy=new Date(now.getFullYear()+1,0,1);const yearPct=((now-soy)/(eoy-soy)*100).toFixed(1);['day','week','month','year'].forEach((id,i)=>{const pct=[dayPct,weekPct,monthPct,yearPct][i];const fill=document.getElementById(`pb-${id}`);const label=document.getElementById(`pb-${id}-pct`);if(fill)fill.style.width=pct+'%';if(label)label.textContent=pct+'%';});}
(function init(){
  hydrate();
  fetchWeather();
  fetchWeatherExtended();
  loadAllCalendarEvents();
  const weatherInterval = setInterval(fetchWeather, CONFIG.WEATHER_API.REFRESH_INTERVAL);
  setInterval(fetchWeatherExtended, 15*60*1000);
})();

// ── PERSISTENCE (localStorage with StorageManager) ──
(function(){
  if(!('localStorage' in window)) return;
  try{
    const root=document.documentElement;
    const savedP = StorageManager.loadWithVersion('palette');
    if(savedP){root.setAttribute('data-palette',savedP);
      document.querySelectorAll('.pal-swatch').forEach(s=>{s.classList.toggle('active',s.dataset.p===savedP);});}
    const savedT = StorageManager.loadWithVersion('theme');
    if(savedT){root.setAttribute('data-theme',savedT);}
    const td = StorageManager.loadWithVersion('todos');
    if(td){state.todos = td; renderTodos();}
    const fs = StorageManager.loadWithVersion('feelings');
    if(fs){document.querySelectorAll('.fc').forEach(ch=>{if(fs.includes(ch.textContent)) ch.classList.add('sel');});
      document.getElementById('fcnt').textContent=fs.length+' '+(fs.length===1?'wybrany':'wybrane');}
    const tp = StorageManager.loadWithVersion('timer');
    if(tp){if(typeof tp.presetIndex==='number')state.timer.presetIndex=tp.presetIndex;if(typeof tp.remaining==='number')state.timer.remaining=tp.remaining;if(typeof tp.sessions==='number')state.timer.session=tp.sessions;}
    const ce = StorageManager.loadWithVersion('calendarEvents');
    if(ce && Array.isArray(ce)){state.calendarEvents=ce;renderCalendar();}
    const hb = StorageManager.loadWithVersion('habits');
    if(hb && Array.isArray(hb)){state.habits=hb;renderHabits();}
    const nt = StorageManager.loadWithVersion('nootropics');
    if(nt && Array.isArray(nt)){state.nootropics=nt;renderNoots();}
    const nl = StorageManager.loadWithVersion('nootropicLog');
    if(nl)state.nootropicLog=nl;
    const sl = StorageManager.loadWithVersion('sleepLog');
    if(sl)state.sleepLog=sl;
    const at = StorageManager.loadWithVersion('archivedTodos');
    if(at && Array.isArray(at))state.archivedTodos=at;
    const es = StorageManager.loadWithVersion('eventStore');
    if(es)state.eventStore=es;
    const ns = StorageManager.loadWithVersion('notes');
    if(typeof ns==='string'){state.notes=ns;document.getElementById('notes').value=ns;}
  }catch(e){console.error('[Persistence] Load failed:', e.message);}
})();

// ── Open-Meteo WEATHER ──
(function(){
  const url='https://api.open-meteo.com/v1/forecast?latitude=53.4285&longitude=14.5528&hourly=temperature_2m,relative_humidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=Europe%2FBerlin';
  fetch(url).then(r=>r.json()).then(d=>{
    const wtmp=document.querySelector('.wtmp');
    const daily=d.daily;
    if(wtmp && daily){wtmp.textContent=Math.round(d.hourly.temperature_2m[0])+'°';}
    const labels=document.querySelectorAll('.wfdl');
    const temps=document.querySelectorAll('.wfdt');
    if(labels.length && daily){
      const dy=daily.temperature_2m_max;
      temps.forEach((el,i)=>{if(dy[i]!=null) el.textContent=Math.round(dy[i])+'°';});
    }
  }).catch(e=>{});
})();

// ═══════════════════════════════════════════════════
// STOCKS MODULE — Yahoo Finance + Black-Scholes
// ═══════════════════════════════════════════════════
const TICKERS=[
  {sym:'NVDA',name:'NVIDIA Corp'},
  {sym:'TSLA',name:'Tesla Inc'},
  {sym:'AAPL',name:'Apple Inc'},
  {sym:'SPY',name:'S&P 500 ETF'},
  {sym:'AMD',name:'AMD Inc'},
  {sym:'BTC-USD',name:'Bitcoin / USD'},
];
// Finnhub symbol mapper
function finnhubSym(sym){if(sym==='BTC-USD')return'BINANCE:BTCUSDT';return sym.replace('-','');}
// Multi-provider quote fetch
async function fetchQuote(sym){
  // 1. Finnhub
  if(CONFIG.FINNHUB_API_KEY||CONFIG.MARKET_NEWS.FINNHUB_API_KEY){const key=CONFIG.FINNHUB_API_KEY||CONFIG.MARKET_NEWS.FINNHUB_API_KEY;try{const fs=finnhubSym(sym);const r=await safeFetch(`https://finnhub.io/api/v1/quote?symbol=${fs}&token=${key}`,{},null);if(r&&r.c&&r.c>0)return{price:r.c,prev:r.pc,chg:r.dp,provider:'finnhub'};}catch(e){}}
  // 2. Alpha Vantage
  if(CONFIG.ALPHA_VANTAGE_KEY){try{const r=await safeFetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${CONFIG.ALPHA_VANTAGE_KEY}`,{},null);if(r&&r['Global Quote']){const q=r['Global Quote'];const p=parseFloat(q['05. price']);const c=parseFloat(q['10. change percent']);if(p)return{price:p,prev:p-(p*c/100),chg:c,provider:'alphavantage'};}}catch(e){}}
  // 3. Polygon.io
  if(CONFIG.POLYGON_KEY){try{const r=await safeFetch(`https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${CONFIG.POLYGON_KEY}`,{},null);if(r&&r.results&&r.results[0]){const d=r.results[0];return{price:d.c,prev:d.o,chg:d.o?((d.c-d.o)/d.o*100):0,provider:'polygon'};}}catch(e){}}
  // 4. Yahoo Finance fallback
  const ydata=await fetchYahoo(sym);if(ydata){const meta=ydata.meta||{};const closes=(ydata.indicators?.quote?.[0]?.close)||[];const price=meta.regularMarketPrice??closes.filter(Boolean).pop();const prev=meta.chartPreviousClose??meta.previousClose;const chg=prev&&price?((price-prev)/prev)*100:null;return{price,prev,chg,closes,provider:'yahoo'};}
  return null;
}
// TradingView modal
function openTVModal(symbol){const m=document.getElementById('tv-widget-modal');if(!m)return;m.style.display='flex';m.onclick=function(e){if(e.target===this)closeTVModal();};document.getElementById('tv-title').textContent=symbol;const c=document.getElementById('tv-chart');c.innerHTML='';const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';script.type='text/javascript';script.async=true;script.innerHTML=JSON.stringify({autosize:true,symbol:symbol,interval:'D',timezone:'Europe/Warsaw',theme:'dark',style:'1',locale:'pl',allow_symbol_change:true,calendar:false,support_host:'https://www.tradingview.com'});const div=document.createElement('div');div.className='tradingview-widget-container';div.style.height='100%';div.appendChild(script);c.appendChild(div);}
function closeTVModal(){document.getElementById('tv-widget-modal').style.display='none';document.getElementById('tv-chart').innerHTML='';}
// Finnhub WebSocket
let finnhubWS=null;
function connectFinnhubWS(){if(!CONFIG.FINNHUB_API_KEY)return;try{finnhubWS=new WebSocket(`wss://ws.finnhub.io?token=${CONFIG.FINNHUB_API_KEY}`);finnhubWS.onopen=()=>{TICKERS.forEach(t=>finnhubWS.send(JSON.stringify({type:'subscribe',symbol:finnhubSym(t.sym)})));};finnhubWS.onmessage=(e)=>{try{const msg=JSON.parse(e.data);if(msg.type==='trade'&&msg.data){msg.data.forEach(trade=>{updateTickerPrice(trade.s,trade.p);});}}catch(ex){}};finnhubWS.onclose=()=>setTimeout(connectFinnhubWS,5000);}catch(e){}}
function updateTickerPrice(wsSym,price){const row=document.querySelector(`[data-ticker-ws="${wsSym}"]`);if(row){const priceEl=row.querySelector('.sp');if(priceEl)priceEl.textContent=fmtP(price);}}

const MACRO_LIST=[
  {sym:'^GSPC',name:'S&P 500'},
  {sym:'^NDX',name:'Nasdaq 100'},
  {sym:'^VIX',name:'VIX'},
  {sym:'GC=F',name:'Gold'},
  {sym:'CL=F',name:'Ropa WTI'},
  {sym:'DX-Y.NYB',name:'DXY'},
  {sym:'EURUSD=X',name:'EUR/USD'},
  {sym:'PLN=X',name:'USD/PLN'},
];
let __sCd=60,__sInt=null;

// ── CORS-resilient Yahoo Finance fetch ──
async function fetchYahoo(sym,range='5d',interval='1d'){
  const base=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`;
  const proxies=[
    `https://corsproxy.io/?url=${encodeURIComponent(base)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(base)}`,
    base,
  ];
  for(const url of proxies){
    try{
      const r=await fetch(url,{headers:{'Accept':'application/json'},signal:AbortSignal.timeout(6000)});
      if(!r.ok) continue;
      const d=await r.json();
      if(d?.chart?.result?.[0]) return d.chart.result[0];
    }catch(e){continue;}
  }
  return null;
}

// ── Helpers ──
function fmtP(p,sym){if(p==null||isNaN(p))return '--';if(sym&&sym.includes('=X'))return p.toFixed(4);return p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtPct(c){if(c==null||isNaN(c))return '--';return(c>=0?'+':'')+c.toFixed(2)+'%';}
function fmtVol(v){if(!v||isNaN(v))return '--';if(v>=1e9)return(v/1e9).toFixed(1)+'B';if(v>=1e6)return(v/1e6).toFixed(1)+'M';return(v/1e3).toFixed(0)+'K';}

// ── SVG Sparkline ──
function spark(closes,up,W=70,H=24){
  const f=(closes||[]).filter(p=>p!=null&&!isNaN(p));
  if(f.length<2){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width',String(W));
    svg.setAttribute('height',String(H));
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1','0');
    line.setAttribute('y1',String(H/2));
    line.setAttribute('x2',String(W));
    line.setAttribute('y2',String(H/2));
    line.setAttribute('stroke','var(--bor)');
    line.setAttribute('stroke-width','1');
    svg.appendChild(line);
    return svg;
  }
  const mn=Math.min(...f),mx=Math.max(...f),rng=mx-mn||1;
  const pts=f.map((p,i)=>`${((i/(f.length-1))*W).toFixed(1)},${(H-2-((p-mn)/rng)*(H-4)).toFixed(1)}`).join(' ');
  const col=up?'var(--nom)':'var(--az)';
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',String(W));
  svg.setAttribute('height',String(H));
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.setAttribute('fill','none');
  const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  poly.setAttribute('points',pts);
  poly.setAttribute('stroke',col);
  poly.setAttribute('stroke-width','1.5');
  poly.setAttribute('stroke-linecap','round');
  poly.setAttribute('stroke-linejoin','round');
  svg.appendChild(poly);
  return svg;
}

// ── Load quotes for array of symbols ──
async function loadQuotes(syms){
  const rs=await Promise.allSettled(syms.map(s=>fetchYahoo(s)));
  const out={};
  syms.forEach((sym,i)=>{
    const r=rs[i].status==='fulfilled'?rs[i].value:null;
    if(!r){out[sym]=null;return;}
    const meta=r.meta||{};
    const closes=(r.indicators?.quote?.[0]?.close)||[];
    const price=meta.regularMarketPrice??closes.filter(Boolean).pop();
    const prev=meta.chartPreviousClose??meta.previousClose??closes.filter(Boolean).slice(-2)[0];
    const chg=prev&&price?((price-prev)/prev)*100:null;
    out[sym]={price,prev,chg,closes,vol:meta.regularMarketVolume};
  });
  return out;
}

// ── Portfel ──
async function renderPortfel(){
  const el=document.getElementById('sl-portfel');
  if(!el) return;
  
  // Render skeletons using DOM methods
  safeDOM.clear(el);
  const fragSkel=document.createDocumentFragment();
  TICKERS.forEach(()=>{
    const skel=document.createElement('div');
    skel.className='sr';
    const leftDiv=document.createElement('div');
    const skel1=document.createElement('div');
    skel1.className='skeleton skeleton-text';
    skel1.style.width='44px';
    skel1.style.height='13px';
    const skel2=document.createElement('div');
    skel2.className='skeleton skeleton-text';
    skel2.style.width='72px';
    skel2.style.height='10px';
    skel2.style.marginTop='4px';
    leftDiv.appendChild(skel1);
    leftDiv.appendChild(skel2);
    const skel3=document.createElement('div');
    skel3.className='skeleton';
    skel3.style.width='70px';
    skel3.style.height='22px';
    skel3.style.borderRadius='2px';
    const skel4=document.createElement('div');
    skel4.className='skeleton skeleton-text';
    skel4.style.width='56px';
    skel4.style.height='13px';
    const skel5=document.createElement('div');
    skel5.className='skeleton skeleton-text';
    skel5.style.width='46px';
    skel5.style.height='13px';
    skel.appendChild(leftDiv);
    skel.appendChild(skel3);
    skel.appendChild(skel4);
    skel.appendChild(skel5);
    fragSkel.appendChild(skel);
  });
  el.appendChild(fragSkel);
  
  const results=await Promise.allSettled(TICKERS.map(t=>fetchQuote(t.sym)));
  const data={};TICKERS.forEach((t,i)=>{data[t.sym]=results[i].status==='fulfilled'?results[i].value:null;});
  safeDOM.clear(el);
  const frag=document.createDocumentFragment();
  TICKERS.forEach(t=>{
    const d=data[t.sym];
    const up=d?(d.chg??0)>=0:true;
    const row=document.createElement('div');
    row.className='sr';
    row.setAttribute('data-ticker-ws',finnhubSym(t.sym));
    const leftDiv=document.createElement('div');
    const symDiv=document.createElement('div');
    symDiv.className='stk mono';
    symDiv.textContent=t.sym;
    const nameDiv=document.createElement('div');
    nameDiv.className='sn';
    nameDiv.textContent=t.name;
    leftDiv.appendChild(symDiv);
    leftDiv.appendChild(nameDiv);
    const svgElement=spark(d?.closes,up);
    const svgContainer=document.createElement('span');
    svgContainer.appendChild(svgElement);
    const priceSpan=document.createElement('span');
    priceSpan.className='sp mono';
    priceSpan.textContent=fmtP(d?.price,t.sym);
    const chgSpan=document.createElement('span');
    chgSpan.className='sc '+(up?'up':'dn');
    chgSpan.textContent=fmtPct(d?.chg);
    const detBtn=document.createElement('button');
    detBtn.className='pill';detBtn.style.cssText='cursor:pointer;font-size:.55rem;padding:1px 6px;margin-left:4px;';
    detBtn.textContent='📈';detBtn.title='Szczegóły';
    detBtn.addEventListener('click',()=>openTVModal(t.sym));
    row.appendChild(leftDiv);
    row.appendChild(svgContainer.firstChild);
    row.appendChild(priceSpan);
    row.appendChild(chgSpan);
    row.appendChild(detBtn);
    frag.appendChild(row);
  });
  el.appendChild(frag);
  const upd=document.getElementById('s-updated');
  if(upd) upd.textContent=new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  updateMktStatus();
}

// ── Makro ──
async function renderMakro(){
  const el=document.getElementById('sl-makro');
  if(!el) return;
  
  // Loading message using DOM
  safeDOM.clear(el);
  const loadingDiv=document.createElement('div');
  loadingDiv.style.padding='.75rem';
  loadingDiv.style.color='var(--txm)';
  loadingDiv.style.fontSize='clamp(.6rem,.58rem + .12vw,.72rem)';
  loadingDiv.textContent='Ładowanie danych makro…';
  el.appendChild(loadingDiv);
  
  const data=await loadQuotes(MACRO_LIST.map(t=>t.sym));
  safeDOM.clear(el);
  const frag=document.createDocumentFragment();
  MACRO_LIST.forEach(t=>{
    const d=data[t.sym];
    const up=d?(d.chg??0)>=0:true;
    const row=document.createElement('div');
    row.className='sr';
    const leftDiv=document.createElement('div');
    const symDiv=document.createElement('div');
    symDiv.className='stk mono';
    symDiv.style.fontSize='clamp(.65rem,.6rem + .2vw,.8rem)';
    symDiv.textContent=t.name;
    const nameDiv=document.createElement('div');
    nameDiv.className='sn';
    nameDiv.textContent=t.sym;
    leftDiv.appendChild(symDiv);
    leftDiv.appendChild(nameDiv);
    const svgElement=spark(d?.closes,up,56,20);
    const svgContainer=document.createElement('span');
    svgContainer.appendChild(svgElement);
    const priceSpan=document.createElement('span');
    priceSpan.className='sp mono';
    priceSpan.textContent=fmtP(d?.price,t.sym);
    const chgSpan=document.createElement('span');
    chgSpan.className='sc '+(up?'up':'dn');
    chgSpan.textContent=fmtPct(d?.chg);
    row.appendChild(leftDiv);
    row.appendChild(svgContainer.firstChild);
    row.appendChild(priceSpan);
    row.appendChild(chgSpan);
    frag.appendChild(row);
  });
  el.appendChild(frag);
}

// ── Market status ──
function updateMktStatus(){
  const n=new Date();const ny=new Date(n.getTime()+n.getTimezoneOffset()*60000-4*3600000);
  const wd=ny.getDay(),hh=ny.getHours(),mm=ny.getMinutes(),ss=ny.getSeconds();
  const open=wd>=1&&wd<=5&&(hh>9||(hh===9&&mm>=30))&&hh<16;
  const dot=document.getElementById('s-dot');const lbl=document.getElementById('s-status');
  if(dot){dot.className='mkt-dot '+(open?'open':'closed');}
  if(lbl){lbl.textContent=open?'NYSE OTWARTY':'NYSE ZAMKNIĘTY';lbl.style.color=open?'var(--nom)':'var(--txm)';}
}

// ── Auto-refresh countdown ──
function startStockRefresh(){
  clearInterval(__sInt);__sCd=60;
  __sInt=setInterval(()=>{
    __sCd--;
    const c=document.getElementById('s-countdown');if(c) c.textContent=`${__sCd}s`;
    updateMktStatus();
    if(__sCd<=0){__sCd=60;renderPortfel();}
  },1000);
}

// ── Tab switcher ──
function switchSTab(btn,key){
  document.querySelectorAll('#s-tabs .ntab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.sp-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const pane=document.getElementById('sp-'+key);
  if(pane) pane.classList.add('active');
}

// ══════════════════════════════════════
// BLACK-SCHOLES ENGINE
// ══════════════════════════════════════
function __erf(x){const t=1/(1+0.3275911*Math.abs(x));const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
function __N(x){return 0.5*(1+__erf(x/Math.SQRT2));}
function __npdf(x){return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);}

function calcBS(S,K,T,r,sigma,type){
  if(T<=0||sigma<=0||S<=0||K<=0) return null;
  const Ty=T/365;
  const d1=(Math.log(S/K)+(r+0.5*sigma*sigma)*Ty)/(sigma*Math.sqrt(Ty));
  const d2=d1-sigma*Math.sqrt(Ty);
  const isC=type==='call';
  const price=isC?S*__N(d1)-K*Math.exp(-r*Ty)*__N(d2):K*Math.exp(-r*Ty)*__N(-d2)-S*__N(-d1);
  const delta=isC?__N(d1):__N(d1)-1;
  const gamma=__npdf(d1)/(S*sigma*Math.sqrt(Ty));
  const theta=isC?(-(S*__npdf(d1)*sigma)/(2*Math.sqrt(Ty))-r*K*Math.exp(-r*Ty)*__N(d2))/365:(-(S*__npdf(d1)*sigma)/(2*Math.sqrt(Ty))+r*K*Math.exp(-r*Ty)*__N(-d2))/365;
  const vega=S*__npdf(d1)*Math.sqrt(Ty)/100;
  const rho=isC?K*Ty*Math.exp(-r*Ty)*__N(d2)/100:-K*Ty*Math.exp(-r*Ty)*__N(-d2)/100;
  return{price,delta,gamma,theta,vega,rho,d1,d2};
}

function updateBS(){
  const S=+document.getElementById('bs-s').value;
  const K=+document.getElementById('bs-k').value;
  const T=+document.getElementById('bs-t').value;
  const iv=+document.getElementById('bs-iv').value/100;
  const r=+document.getElementById('bs-r').value/100;
  const type=document.getElementById('bs-type').value;
  const res=calcBS(S,K,T,r,iv,type);
  if(!res) return;
  const f=(v,d)=>isNaN(v)?'--':v.toFixed(d);
  document.getElementById('bs-price').textContent=f(res.price,2);
  document.getElementById('bs-delta').textContent=f(res.delta,4);
  document.getElementById('bs-gamma').textContent=f(res.gamma,6);
  document.getElementById('bs-theta').textContent=f(res.theta,4);
  document.getElementById('bs-vega').textContent=f(res.vega,4);
  document.getElementById('bs-rho').textContent=f(res.rho,4);
  document.getElementById('bs-d1').textContent=f(res.d1,4);
  document.getElementById('bs-d2').textContent=f(res.d2,4);
  // interpretacja
  const moneyness=S>K?'ITM':S<K?'OTM':'ATM';
  const interp=document.getElementById('bs-interp');
  if(interp) interp.textContent=`Opcja ${type.toUpperCase()} | ${moneyness} | Δ≈${f(res.delta,2)} → zmiana ceny na $1 ruchu spotu. Θ=${f(res.theta,2)} $/dzień (decay). IV=${(iv*100).toFixed(1)}% → Vega=$${f(res.vega,2)} na 1% IV.`;
  // payoff chart
  buildPayoff(S,K,res.price,type);
}

function buildPayoff(S,K,prem,type){
  const svg=document.getElementById('bs-payoff');
  if(!svg) return;
  const W=220,H=70,n=60,span=K*0.45;
  const pts=Array.from({length:n+1},(_,i)=>{
    const price=K-span+(i/n)*span*2;
    const pnl=(type==='call'?Math.max(0,price-K):Math.max(0,K-price))-prem;
    return{x:price,y:pnl};
  });
  const mn=Math.min(...pts.map(p=>p.y)),mx=Math.max(...pts.map(p=>p.y)),rng=mx-mn||1;
  const tx=x=>((x-(K-span))/(span*2))*W;
  const ty=y=>H-((y-mn)/rng)*H;
  const zy=ty(0).toFixed(1);
  const kx=tx(K).toFixed(1);
  const sx=tx(S).toFixed(1);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  safeDOM.clear(svg);
  
  // Create SVG elements using createElementNS
  const ns='http://www.w3.org/2000/svg';
  
  // Zero line
  const zeroLine=document.createElementNS(ns,'line');
  zeroLine.setAttribute('x1','0');
  zeroLine.setAttribute('y1',zy);
  zeroLine.setAttribute('x2',String(W));
  zeroLine.setAttribute('y2',zy);
  zeroLine.setAttribute('stroke','var(--bor)');
  zeroLine.setAttribute('stroke-width','1');
  svg.appendChild(zeroLine);
  
  // Strike price line
  const strikeLine=document.createElementNS(ns,'line');
  strikeLine.setAttribute('x1',kx);
  strikeLine.setAttribute('y1','0');
  strikeLine.setAttribute('x2',kx);
  strikeLine.setAttribute('y2',String(H));
  strikeLine.setAttribute('stroke','var(--txf)');
  strikeLine.setAttribute('stroke-width','1');
  strikeLine.setAttribute('stroke-dasharray','3,3');
  svg.appendChild(strikeLine);
  
  // Spot price line
  const spotLine=document.createElementNS(ns,'line');
  spotLine.setAttribute('x1',sx);
  spotLine.setAttribute('y1','0');
  spotLine.setAttribute('x2',sx);
  spotLine.setAttribute('y2',String(H));
  spotLine.setAttribute('stroke','var(--a1)');
  spotLine.setAttribute('stroke-width','1');
  spotLine.setAttribute('stroke-dasharray','2,4');
  spotLine.setAttribute('opacity','.7');
  svg.appendChild(spotLine);
  
  // Payoff polyline
  const polypts=pts.map(p=>`${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ');
  const payoffLine=document.createElementNS(ns,'polyline');
  payoffLine.setAttribute('points',polypts);
  payoffLine.setAttribute('fill','none');
  payoffLine.setAttribute('stroke','var(--a1)');
  payoffLine.setAttribute('stroke-width','1.5');
  payoffLine.setAttribute('stroke-linecap','round');
  payoffLine.setAttribute('stroke-linejoin','round');
  svg.appendChild(payoffLine);
}

// ── INIT stocks ──
(async()=>{
  updateMktStatus();
  await renderPortfel();
  renderMakro();
  startStockRefresh();
  updateBS();
  connectFinnhubWS();
  renderFinanceWidgets();
})();


// ═══════════════════════════════════════════════════
// MEDICAL CALCULATORS
// ═══════════════════════════════════════════════════

function switchMed(btn,key){
  document.querySelectorAll('#med-tabs .ntab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.mp').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const p=document.getElementById('mp-'+key);if(p)p.classList.add('active');
}

// ── helper: set result ──
function mSet(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function mBadge(id,cls,text){const el=document.getElementById(id);if(!el)return;el.className='calc-badge '+cls;el.textContent=text;}

// ── Medical Validation Utilities ──
const medicalValidation = {
  creatinine: (val) => val >= 0.1 && val <= 20,
  age: (val) => val >= 0 && val <= 120,
  weight: (val) => val >= 1 && val <= 300,
  height: (val) => val >= 50 && val <= 250,
  temperature: (val) => val >= 35 && val <= 42,
  heartRate: (val) => val >= 30 && val <= 220,
  systolicBP: (val) => val >= 70 && val <= 250,
  diastolicBP: (val) => val >= 40 && val <= 150,
  validate: function(field, value) {
    if (!this[field]) return true;
    return this[field](value);
  },
  getError: function(field, value) {
    const ranges = {
      creatinine: '0.1–20 mg/dL',
      age: '0–120 lat',
      weight: '1–300 kg',
      height: '50–250 cm',
      temperature: '35–42°C',
      heartRate: '30–220 bpm',
      systolicBP: '70–250 mmHg',
      diastolicBP: '40–150 mmHg'
    };
    return `BŁĄD: ${field} poza zakresem (${ranges[field] || 'niedozwolony'})`;
  }
};

// ── eGFR CKD-EPI 2021 ──
function mCalcEGFR(){
  const scr=+document.getElementById('egfr-scr').value;
  const age=+document.getElementById('egfr-age').value;
  const sex=document.getElementById('egfr-sex').value;
  
  // Validate inputs
  if(!scr||!age) { mSet('egfr-val','---'); mSet('egfr-interp','Brak danych'); return; }
  if(!medicalValidation.creatinine(scr)) { mSet('egfr-val','BŁĄD'); mSet('egfr-interp', medicalValidation.getError('creatinine', scr)); return; }
  if(!medicalValidation.age(age)) { mSet('egfr-val','BŁĄD'); mSet('egfr-interp', medicalValidation.getError('age', age)); return; }
  
  const kappa=sex==='F'?0.7:0.9,alpha=sex==='F'?-0.241:-0.302,femFactor=sex==='F'?1.012:1;
  const r=scr/kappa;
  const gfr=142*Math.pow(Math.min(r,1),alpha)*Math.pow(Math.max(r,1),-1.200)*Math.pow(0.9938,age)*femFactor;
  const g=Math.round(gfr);
  mSet('egfr-val',g);
  let stage,cls,interp;
  if(g>=90){stage='G1';cls='ok';interp='Prawidłowe lub wysokie';}
  else if(g>=60){stage='G2';cls='ok';interp='Łagodnie obniżone';}
  else if(g>=45){stage='G3a';cls='warn';interp='Łagodnie–umiarkowanie obniżone';}
  else if(g>=30){stage='G3b';cls='warn';interp='Umiarkowanie–znacznie obniżone';}
  else if(g>=15){stage='G4';cls='crit';interp='Znacznie obniżone';}
  else{stage='G5';cls='crit';interp='Niewydolność nerek';}
  mBadge('egfr-stage',cls,stage);mSet('egfr-interp',interp);
}

// ── Cockcroft-Gault ──
function mCalcCG(){
  const scr=+document.getElementById('cg-scr').value;
  const age=+document.getElementById('cg-age').value;
  const wt=+document.getElementById('cg-wt').value;
  const sex=document.getElementById('cg-sex').value;
  
  // Validate inputs
  if(!scr||!age||!wt) { mSet('cg-val','---'); mSet('cg-interp','Brak danych'); return; }
  if(!medicalValidation.creatinine(scr)) { mSet('cg-val','BŁĄD'); mSet('cg-interp', medicalValidation.getError('creatinine', scr)); return; }
  if(!medicalValidation.age(age)) { mSet('cg-val','BŁĄD'); mSet('cg-interp', medicalValidation.getError('age', age)); return; }
  if(!medicalValidation.weight(wt)) { mSet('cg-val','BŁĄD'); mSet('cg-interp', medicalValidation.getError('weight', wt)); return; }
  
  const crcl=((140-age)*wt/(72*scr))*(sex==='F'?0.85:1);
  const c=Math.round(crcl);
  mSet('cg-val',c);
  let stage,cls,interp;
  if(c>=90){stage='Normal';cls='ok';interp='Pełna czynność';}
  else if(c>=60){stage='Łagodna';cls='ok';interp='Dawkowanie standardowe';}
  else if(c>=30){stage='Umiarkowana';cls='warn';interp='Redukcja dawki wielu leków';}
  else if(c>=15){stage='Ciężka';cls='crit';interp='Znaczna redukcja dawek';}
  else{stage='Schyłkowa';cls='crit';interp='Hemodializa / dializoterapia';}
  mBadge('cg-stage',cls,stage);mSet('cg-interp',interp);
}

// ── CHA₂DS₂-VASc ──
const CHADS_RISK=['0%','1.3%','2.2%','3.2%','4.0%','6.7%','9.8%','9.6%','12.5%','15.2%'];
function mCalcCHADS(){
  let s=0;
  if(document.getElementById('ch-chf').checked) s+=1;
  if(document.getElementById('ch-htn').checked) s+=1;
  if(document.getElementById('ch-age75').checked) s+=2;
  if(document.getElementById('ch-dm').checked) s+=1;
  if(document.getElementById('ch-stroke').checked) s+=2;
  if(document.getElementById('ch-vasc').checked) s+=1;
  if(document.getElementById('ch-age6574').checked) s+=1;
  if(document.getElementById('ch-female').checked) s+=1;
  mSet('chads-val',s);
  const risk=CHADS_RISK[Math.min(s,9)];
  let cls,rec;
  if(s===0){cls='ok';rec='Brak antykoagulacji';}
  else if(s===1&&!document.getElementById('ch-female').checked){cls='warn';rec='Rozważyć NOAC';}
  else if(s===1){cls='ok';rec='Czynnik ryzyka płci';}
  else{cls='crit';rec='NOAC wskazany (ESC)';}
  mBadge('chads-risk',cls,s<=1?'NISKIE':s<=3?'UMIARKOWANE':'WYSOKIE');
  mSet('chads-interp',risk+' rocz. ryzyko. '+rec);
}

// ── GCS ──
function mCalcGCS(){
  const e=+document.getElementById('gcs-e').value;
  const v=+document.getElementById('gcs-v').value;
  const m=+document.getElementById('gcs-m').value;
  const total=e+v+m;
  mSet('gcs-val',total);mSet('gcs-sub','E'+e+'V'+v+'M'+m);
  let cls,sev,interp;
  if(total>=13){cls='ok';sev='ŁAGODNY';interp='GCS 13–15';}
  else if(total>=9){cls='warn';sev='UMIARKOWANY';interp='GCS 9–12';}
  else{cls='crit';sev='CIĘŻKI';interp='GCS ≤8 → intubacja';}
  mBadge('gcs-sev',cls,sev);mSet('gcs-interp',interp);
}

// ── CURB-65 ──
function mCalcCURB(){
  let s=0;
  ['curb-c','curb-u','curb-r','curb-b','curb-65'].forEach(id=>{if(document.getElementById(id).checked)s++;});
  mSet('curb-val',s);
  let cls,lev,interp;
  if(s<=1){cls='ok';lev='NISKIE';interp='Ambulatoryjne. Śm. 1–2%';}
  else if(s===2){cls='warn';lev='POŚREDNIE';interp='Hospitalizacja. Śm. ~9%';}
  else{cls='crit';lev='WYSOKIE';interp='OIT do rozważenia. Śm. ~17–22%';}
  mBadge('curb-lev',cls,lev);mSet('curb-interp',interp);
}

// ── Wells DVT ──
function mCalcWells(){
  let s=0;
  ['dvt-ca','dvt-par','dvt-bed','dvt-sw','dvt-cf','dvt-pe','dvt-col','dvt-prev'].forEach(id=>{if(document.getElementById(id).checked)s++;});
  if(document.getElementById('dvt-alt').checked)s-=2;
  mSet('wells-val',s);
  let cls,lev,interp;
  if(s<1){cls='ok';lev='NISKIE';interp='~3% prawdopodb. DVT. D-dimer i obserwacja.';}
  else if(s<=2){cls='warn';lev='POŚREDNIE';interp='~17% prawdopodb. USG żył.';}
  else{cls='crit';lev='WYSOKIE';interp='~75% prawdopodb. USG + antykoagulacja.';}
  mBadge('wells-lev',cls,lev);mSet('wells-interp',interp);
}

// ── APGAR ──
function mCalcAPGAR(){
  const s=['ap-app','ap-pul','ap-gri','ap-act','ap-res'].reduce((a,id)=>a+ +document.getElementById(id).value,0);
  mSet('apgar-val',s);
  let cls,lev,interp;
  if(s>=7){cls='ok';lev='NORMA';interp='Stan dobry. Rutynowe postępowanie.';}
  else if(s>=4){cls='warn';lev='UMIARKOWANY';interp='Wsparcie oddechowe, ciepło, stymulacja.';}
  else{cls='crit';lev='KRYTYCZNY';interp='Natychmiastowa resuscytacja noworodka!';}
  mBadge('apgar-lev',cls,lev);mSet('apgar-interp',interp);
}

// ── Centor / McIsaac ──
function mCalcCentor(){
  let s=0;
  ['cen-exud','cen-node','cen-temp','cen-cough'].forEach(id=>{if(document.getElementById(id).checked)s++;});
  const age=document.getElementById('cen-age').value;
  if(age==='-1'||age==='-1b') s--;
  mSet('cen-val',s);
  let cls,lev,interp;
  if(s<=0){cls='ok';lev='NISKIE';interp='&lt;10% GAS. Nie leczyć antybiotykiem.';}
  else if(s<=1){cls='ok';lev='NISKIE';interp='~10% GAS. Obserwacja bez antybiotyku.';}
  else if(s===2){cls='warn';lev='POŚREDNIE';interp='~17–35% GAS. Rozważyć wymazanie gardła.';}
  else if(s===3){cls='warn';lev='UMIARKOWANE';interp='~35–56% GAS. Penicy lina V lub amoksy.';}
  else{cls='crit';lev='WYSOKIE';interp='~52–65% GAS. Antybiotyk empirycznie.';}
  mBadge('cen-lev',cls,lev);
  const i=document.getElementById('cen-interp');
  if(i){
    // Decode HTML entities safely and set as textContent
    const decoded=interp.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    i.textContent=decoded;
  }
}

// ── BMI + BSA ──
function mCalcBMI(){
  const wt=+document.getElementById('bmi-wt').value;
  const ht=+document.getElementById('bmi-ht').value;
  
  // Validate inputs
  if(!wt||!ht) { mSet('bmi-val','---'); mSet('bsa-val','---'); mSet('bmi-interp','Brak danych'); return; }
  if(!medicalValidation.weight(wt)) { mSet('bmi-val','BŁĄD'); mSet('bsa-val','BŁĄD'); mSet('bmi-interp', medicalValidation.getError('weight', wt)); return; }
  if(!medicalValidation.height(ht)) { mSet('bmi-val','BŁĄD'); mSet('bsa-val','BŁĄD'); mSet('bmi-interp', medicalValidation.getError('height', ht)); return; }
  
  const h=ht/100,bmi=wt/(h*h),bsa=Math.sqrt((wt*ht)/3600);
  mSet('bmi-val',bmi.toFixed(1));mSet('bsa-val',bsa.toFixed(2));
  let cls,lev,interp;
  if(bmi<18.5){cls='warn';lev='Niedowaga';interp='BMI<18.5';}
  else if(bmi<25){cls='ok';lev='Norma';interp='18.5–24.9';}
  else if(bmi<30){cls='warn';lev='Nadwaga';interp='25–29.9';}
  else if(bmi<35){cls='crit';lev='Otyłość I';interp='30–34.9';}
  else if(bmi<40){cls='crit';lev='Otyłość II';interp='35–39.9';}
  else{cls='crit';lev='Otyłość III';interp='BMI≥40 (chorobliwa)';}
  mBadge('bmi-lev',cls,lev);mSet('bmi-interp',interp);
}

// ── Child-Pugh ──
function mCalcCP(){
  const s=['cp-bil','cp-alb','cp-inr','cp-asc','cp-enc'].reduce((a,id)=>a+ +document.getElementById(id).value,0);
  mSet('cp-val',s);
  let cls,lev,interp;
  if(s<=6){cls='ok';lev='Klasa A';interp='Śmiertelność <5% / rok. Dobra rezerwa.';}
  else if(s<=9){cls='warn';lev='Klasa B';interp='Śmiertelność 20–30% / rok. Umiarkowana.';}
  else{cls='crit';lev='Klasa C';interp='Śmiertelność >80% / rok. Zła rezerwa.';}
  mBadge('cp-cls',cls,lev);mSet('cp-interp',interp);
}

// ── Wells PE ──
function mCalcWellsPE(){
  let s=0;
  ['pe-dvt','pe-hr','pe-immob','pe-signs','pe-hemo','pe-cancer','pe-noalt'].forEach(id=>{const el=document.getElementById(id);if(el&&el.checked)s++;});
  mSet('wellspe-val',s);
  let cls,lev,interp;
  if(s<=1){cls='ok';lev='NISKIE';interp='PE mało prawdopodobna. D-dimer.';}
  else if(s<=4){cls='warn';lev='POŚREDNIE';interp='PE możliwa. CTPA / V/Q.';}
  else{cls='crit';lev='WYSOKIE';interp='PE bardzo prawdopodobna. CTPA natychmiast.';}
  mBadge('wellspe-lev',cls,lev);mSet('wellspe-interp',interp);
}

// ── PERC Rule ──
function mCalcPERC(){
  const ids=['perc-age','perc-hr','perc-sao2','perc-leg','perc-hemo','perc-surg','perc-dvthx','perc-estro'];
  let allMet=true;
  ids.forEach(id=>{const el=document.getElementById(id);if(el&&!el.checked)allMet=false;});
  const met=ids.filter(id=>{const el=document.getElementById(id);return el&&el.checked;}).length;
  mSet('perc-val',met+'/'+ids.length);
  if(allMet){
    mBadge('perc-lev','ok','UJEMNY');mSet('perc-interp','Wszystkie spełnione. PE wykluczona klinicznie.');
  }else{
    mBadge('perc-lev','warn','DODATNI');mSet('perc-interp','Nie wszystkie spełnione. Dalsze badania (D-dimer / CTPA).');
  }
}

// ── MAP (Mean Arterial Pressure) ──
function mCalcMAP(){
  const sys=+document.getElementById('map-sys').value;
  const dia=+document.getElementById('map-dia').value;
  if(!sys||!dia){mSet('map-val','---');mSet('map-interp','Brak danych');return;}
  if(!medicalValidation.systolicBP(sys)){mSet('map-val','BŁĄD');mSet('map-interp',medicalValidation.getError('systolicBP',sys));return;}
  if(!medicalValidation.diastolicBP(dia)){mSet('map-val','BŁĄD');mSet('map-interp',medicalValidation.getError('diastolicBP',dia));return;}
  const map=Math.round(dia+(sys-dia)/3);
  mSet('map-val',map);
  let cls,lev,interp;
  if(map>=70&&map<=105){cls='ok';lev='NORMA';interp='Prawidłowe ciśnienie perfuzji.';}
  else if(map<70){cls='crit';lev='NISKIE';interp='Hipoperfuzja narządowa! Rozważ wazopresory.';}
  else{cls='warn';lev='WYSOKIE';interp='Podwyższone MAP. Monitoruj narządy docelowe.';}
  mBadge('map-lev',cls,lev);mSet('map-interp',interp);
}

// ── Anion Gap ──
function mCalcAG(){
  const na=+document.getElementById('ag-na').value;
  const cl=+document.getElementById('ag-cl').value;
  const hco3=+document.getElementById('ag-hco3').value;
  if(!na||!cl||!hco3){mSet('ag-val','---');mSet('ag-interp','Brak danych');return;}
  const ag=na-cl-hco3;
  mSet('ag-val',ag.toFixed(1));
  let cls,lev,interp;
  if(ag>=8&&ag<=12){cls='ok';lev='NORMA';interp='Prawidłowa luka anionowa (8–12 mEq/L).';}
  else if(ag>12){cls='crit';lev='PODWYŻSZONA';interp='Kwasica metaboliczna z podwyższoną AG. MUDPILES.';}
  else{cls='warn';lev='OBNIŻONA';interp='Niska AG. Rozważ hipoalbuminemię, zatrucie litem.';}
  mBadge('ag-lev',cls,lev);mSet('ag-interp',interp);
}

// ── Corrected Calcium ──
function mCalcCa(){
  const total=+document.getElementById('ca-total').value;
  const alb=+document.getElementById('ca-alb').value;
  if(!total||!alb){mSet('ca-val','---');mSet('ca-interp','Brak danych');return;}
  const corrected=total+0.8*(4.0-alb);
  mSet('ca-val',corrected.toFixed(2));
  let cls,lev,interp;
  if(corrected>=8.5&&corrected<=10.5){cls='ok';lev='NORMA';interp='Skorygowane Ca w normie (8.5–10.5 mg/dL).';}
  else if(corrected>10.5){cls='crit';lev='HIPERKALCEMIA';interp='Podwyższone Ca. Rozważ PTH, nowotwór, wit. D.';}
  else{cls='warn';lev='HIPOKALCEMIA';interp='Obniżone Ca. Rozważ suplementację, PTH, Mg.';}
  mBadge('ca-lev',cls,lev);mSet('ca-interp',interp);
}

// ── SOFA Score ──
function mCalcSOFA(){
  const s=['sofa-resp','sofa-plt','sofa-bil','sofa-cv','sofa-gcs','sofa-cr'].reduce((a,id)=>a+ +document.getElementById(id).value,0);
  mSet('sofa-val',s);
  let cls,lev,interp;
  if(s<=1){cls='ok';lev='NISKIE';interp='Śmiertelność <10%.';}
  else if(s<=3){cls='ok';lev='NISKIE-ŚR';interp='Śmiertelność 15–20%.';}
  else if(s<=5){cls='warn';lev='ŚREDNIE';interp='Śmiertelność 25–30%.';}
  else if(s<=7){cls='warn';lev='WYSOKIE';interp='Śmiertelność ~45%.';}
  else{cls='crit';lev='KRYTYCZNE';interp='Śmiertelność >50%! Eskalacja leczenia.';}
  mBadge('sofa-lev',cls,lev);mSet('sofa-interp',interp);
}

// ── qSOFA ──
function mCalcQSOFA(){
  let s=0;
  ['qsofa-gcs','qsofa-rr','qsofa-sbp'].forEach(id=>{if(document.getElementById(id).checked)s++;});
  mSet('qsofa-val',s);
  let cls,lev,interp;
  if(s<2){cls='ok';lev='NISKIE';interp='Niskie ryzyko sepsy.';}
  else{cls='crit';lev='WYSOKIE';interp='Wg Sepsis-3: podejrzenie sepsy → sprawdź SOFA.';}
  mBadge('qsofa-lev',cls,lev);mSet('qsofa-interp',interp);
}

// ── MELD-Na ──
function mCalcMELD(){
  let bil=Math.max(1,+document.getElementById('meld-bil').value);
  let inr=Math.max(1,+document.getElementById('meld-inr').value);
  let cr=Math.max(1,+document.getElementById('meld-cr').value);
  let na=+document.getElementById('meld-na').value;
  const dial=document.getElementById('meld-dial').checked;
  if(!bil||!inr||!cr||!na){mSet('meld-val','---');mSet('meld-interp','Brak danych');return;}
  if(dial)cr=4.0;
  cr=Math.min(cr,4.0);
  na=Math.max(125,Math.min(137,na));
  let meld=10*(0.957*Math.log(cr)+0.378*Math.log(bil)+1.120*Math.log(inr)+0.643);
  meld=Math.min(40,Math.round(meld));
  let meldNa=meld+1.32*(137-na)-(0.033*meld*(137-na));
  meldNa=Math.max(6,Math.min(40,Math.round(meldNa)));
  mSet('meld-val',meldNa);
  let cls,lev,interp;
  if(meldNa<=9){cls='ok';lev='NISKI';interp='Śm. 90d: 1.9%. Niska priorytet transplantacji.';}
  else if(meldNa<=19){cls='warn';lev='ŚREDNI';interp='Śm. 90d: 6%. Rozważyć kwalifikację.';}
  else if(meldNa<=29){cls='warn';lev='WYSOKI';interp='Śm. 90d: 19.6%. Priorytet transplantacji.';}
  else{cls='crit';lev='KRYTYCZNY';interp='Śm. 90d: 52.6%+. Pilna transplantacja.';}
  mBadge('meld-lev',cls,lev);mSet('meld-interp','MELD='+meld+' | MELD-Na='+meldNa+'. '+interp);
}

// ── NEWS2 ──
function mCalcNEWS(){
  const parseV=v=>{const n=parseInt(v);return isNaN(n)?parseInt(v.replace(/\D/g,'')):n;};
  let s=0;
  s+=parseV(document.getElementById('news-rr').value);
  const copd=document.getElementById('news-copd').checked;
  const spo2v=document.getElementById('news-spo2').value;
  if(copd){const m={'3':3,'2':2,'1':0,'0':0};s+=m[spo2v]!==undefined?m[spo2v]:parseV(spo2v);}
  else{s+=parseV(spo2v);}
  if(document.getElementById('news-o2').checked)s+=2;
  s+=parseV(document.getElementById('news-temp').value);
  s+=parseV(document.getElementById('news-sbp').value);
  s+=parseV(document.getElementById('news-hr').value);
  s+=parseV(document.getElementById('news-avpu').value);
  mSet('news-val',s);
  const vals=[parseV(document.getElementById('news-rr').value),parseV(spo2v),parseV(document.getElementById('news-temp').value),parseV(document.getElementById('news-sbp').value),parseV(document.getElementById('news-hr').value),parseV(document.getElementById('news-avpu').value)];
  const has3=vals.some(v=>v>=3);
  let cls,lev,interp;
  if(s>=7){cls='crit';lev='WYSOKIE';interp='Pilna eskalacja! Zespół resuscytacyjny.';}
  else if(s>=5||has3){cls='warn';lev='ŚREDNIE';interp='Pilna ocena — rozważ OIT.';}
  else{cls='ok';lev='NISKIE';interp='Rutynowa obserwacja.';}
  mBadge('news-lev',cls,lev);mSet('news-interp',interp);
}

// ── Henderson-Hasselbalch ──
function mCalcHH(){
  const ph=+document.getElementById('hh-ph').value;
  const pco2=+document.getElementById('hh-pco2').value;
  const hco3=+document.getElementById('hh-hco3').value;
  const pao2=+document.getElementById('hh-pao2').value;
  const fio2=+document.getElementById('hh-fio2').value;
  const na=+document.getElementById('hh-na').value;
  const cl=+document.getElementById('hh-cl').value;
  const alb=+document.getElementById('hh-alb').value;
  if(!ph||!pco2||!hco3){mSet('hh-interp','Brak danych');return;}
  const lines=[];
  const calcPh=6.1+Math.log10(hco3/(0.03*pco2));
  lines.push('pH obliczone: '+calcPh.toFixed(2));
  if(pao2&&fio2){
    const pf=pao2/(fio2/100);
    lines.push('P/F ratio: '+pf.toFixed(0)+(pf<200?' (ciężki ARDS)':pf<300?' (ARDS)':' (norma)'));
    const aa=(fio2/100*(760-47))-(pco2/0.8)-pao2;
    lines.push('A-a gradient: '+aa.toFixed(1)+' mmHg'+(aa>15?' ↑':''));
  }
  if(na&&cl){
    const ag=na-cl-hco3;
    lines.push('Anion Gap: '+ag.toFixed(1)+(ag>12?' ↑':''));
    if(alb){const agc=ag+2.5*(4.0-alb);lines.push('AG korygowany: '+agc.toFixed(1));}
    if(ag>12){const dd=(ag-12)/(24-hco3);lines.push('Delta-delta: '+dd.toFixed(2)+(dd>2?' (zasadowica met.)':dd<1?' (non-AG acidosis+)':''));}
  }
  // Interpretacja
  let disorder='';
  if(ph<7.35){
    disorder=hco3<22?'Kwasica metaboliczna':'Kwasica oddechowa';
    if(hco3<22){const expPco2=1.5*hco3+8;lines.push('Winter: PaCO₂ ocz.='+expPco2.toFixed(0)+'±2'+(pco2<expPco2-2?' +oddech. komp.':pco2>expPco2+2?' +oddech. kwasica':''));}
  }else if(ph>7.45){
    disorder=hco3>26?'Zasadowica metaboliczna':'Zasadowica oddechowa';
  }else{disorder='Norma (7.35–7.45)';}
  lines.push(disorder);
  const el=document.getElementById('hh-interp');if(el)el.textContent=lines.join('\n');
}

// ── Dawkowanie ──
function mCalcDose(){
  const wt=+document.getElementById('dose-wt').value;
  const mgkg=+document.getElementById('dose-mgkg').value;
  const mcgkgmin=+document.getElementById('dose-mcgkgmin').value;
  const conc=+document.getElementById('dose-conc').value;
  if(!wt){mSet('dose-interp','Podaj masę ciała');return;}
  const lines=[];
  if(mgkg){const dose=wt*mgkg;lines.push('Dawka: '+dose.toFixed(1)+' mg');}
  if(mcgkgmin){
    const mcgMin=wt*mcgkgmin;
    const mgH=mcgMin*60/1000;
    lines.push('Wlew: '+mcgMin.toFixed(1)+' mcg/min');
    lines.push('      '+mgH.toFixed(2)+' mg/h');
    if(conc){const mlH=mgH/conc;lines.push('Prędkość: '+mlH.toFixed(1)+' mL/h');}
  }
  if(!lines.length)lines.push('Podaj dawkę mg/kg lub mcg/kg/min');
  const el=document.getElementById('dose-interp');if(el)el.textContent=lines.join('\n');
}

// ── QTc ──
function mCalcQTc(){
  const qt=+document.getElementById('qtc-qt').value;
  const hr=+document.getElementById('qtc-hr').value;
  if(!qt||!hr){mSet('qtc-val','---');mSet('qtc-interp','Brak danych');return;}
  const rr=60/hr;
  const bazett=qt/Math.sqrt(rr);
  const fridericia=qt/Math.cbrt(rr);
  const framingham=qt+154*(1-rr);
  mSet('qtc-val',Math.round(bazett));
  let cls,lev,interp;
  if(bazett>500){cls='crit';lev='KRYTYCZNY';interp='QTc>500ms — ryzyko TdP!';}
  else if(bazett>470){cls='warn';lev='WYDŁUŻONY';interp='QTc wydłużony (>470ms ♀).';}
  else if(bazett>450){cls='warn';lev='GRANICZNY';interp='QTc graniczny (>450ms ♂).';}
  else{cls='ok';lev='NORMA';interp='QTc w normie.';}
  mBadge('qtc-lev',cls,lev);
  mSet('qtc-interp','Bazett:'+Math.round(bazett)+' Frid:'+Math.round(fridericia)+' Fram:'+Math.round(framingham)+'ms. '+interp);
}

// ── CALC_VERSIONS ──
const CALC_VERSIONS={
  'eGFR':{version:'2021.1',formula:'CKD-EPI 2021'},'CG':{version:'1976.1',formula:'Cockcroft-Gault'},
  'CHADS':{version:'2010.1',formula:'CHA₂DS₂-VASc'},'GCS':{version:'1974.1',formula:'Teasdale & Jennett'},
  'CURB-65':{version:'2003.1',formula:'Lim WS et al'},'Wells-DVT':{version:'2003.1',formula:'Wells PS et al'},
  'APGAR':{version:'1953.1',formula:'Virginia Apgar'},'Centor':{version:'1981.1',formula:'Centor/McIsaac'},
  'BMI':{version:'1832.1',formula:'Quetelet/Mosteller'},'Child-Pugh':{version:'1973.1',formula:'Pugh RN et al'},
  'Wells-PE':{version:'2000.1',formula:'Wells PS et al'},'PERC':{version:'2004.1',formula:'Kline JA et al'},
  'MAP':{version:'std',formula:'MAP = DBP + (SBP-DBP)/3'},'AG':{version:'std',formula:'Na - Cl - HCO₃'},
  'Ca-corr':{version:'std',formula:'Ca + 0.8×(4-Alb)'},'SOFA':{version:'1996.1',formula:'Vincent JL et al'},
  'qSOFA':{version:'2016.1',formula:'Seymour CW et al (Sepsis-3)'},'NEWS2':{version:'2017.1',formula:'RCP UK'},
  'MELD-Na':{version:'2016.1',formula:'OPTN/UNOS'},'Henderson-Hasselbalch':{version:'1917.1',formula:'Henderson-Hasselbalch'},
  'QTc':{version:'1920.1',formula:'Bazett/Fridericia/Framingham'},'Dose':{version:'std',formula:'mg/kg, mcg/kg/min'}
};

// ── Analytics rendering ──
function renderAnalytics(){
  // Trend chart (last 14 days)
  const tc=document.getElementById('analytics-trend-chart');
  if(!tc)return;
  const habits=state.habits||[];
  const days=14;
  const rates=[];
  for(let i=0;i<days;i++){
    let done=0,total=0;
    habits.forEach(h=>{if(h.d&&h.d.length>i){total++;if(h.d[i])done++;}});
    rates.push(total?done/total:0);
  }
  // SVG trend line
  const W=280,H=70,ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('width','100%');svg.setAttribute('height','80');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','none');
  // gradient area
  const defs=document.createElementNS(ns,'defs');
  const grad=document.createElementNS(ns,'linearGradient');
  grad.setAttribute('id','trend-grad');grad.setAttribute('x1','0');grad.setAttribute('y1','0');grad.setAttribute('x2','0');grad.setAttribute('y2','1');
  const s1=document.createElementNS(ns,'stop');s1.setAttribute('offset','0%');s1.setAttribute('stop-color','var(--nom)');s1.setAttribute('stop-opacity','0.3');
  const s2=document.createElementNS(ns,'stop');s2.setAttribute('offset','100%');s2.setAttribute('stop-color','var(--nom)');s2.setAttribute('stop-opacity','0.02');
  grad.appendChild(s1);grad.appendChild(s2);defs.appendChild(grad);svg.appendChild(defs);
  const pts=rates.map((r,i)=>`${((i/(days-1))*W).toFixed(1)},${(H-4-(r*(H-8))).toFixed(1)}`);
  // Area fill
  const area=document.createElementNS(ns,'polygon');
  area.setAttribute('points',`0,${H} ${pts.join(' ')} ${W},${H}`);
  area.setAttribute('fill','url(#trend-grad)');svg.appendChild(area);
  // Line
  const line=document.createElementNS(ns,'polyline');
  line.setAttribute('points',pts.join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','var(--nom)');line.setAttribute('stroke-width','2');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');
  svg.appendChild(line);
  // Labels
  const avg=rates.reduce((a,b)=>a+b,0)/rates.length;
  const txt=document.createElementNS(ns,'text');txt.setAttribute('x','4');txt.setAttribute('y','12');txt.setAttribute('fill','var(--txm)');txt.setAttribute('font-size','9');txt.textContent='Śr: '+(avg*100).toFixed(0)+'%';
  svg.appendChild(txt);
  safeDOM.clear(tc);tc.appendChild(svg);

  // Heatmap
  const hm=document.getElementById('analytics-heatmap');
  if(hm){
    safeDOM.clear(hm);
    const frag=document.createDocumentFragment();
    for(let i=0;i<days;i++){
      let done=0,total=0;
      habits.forEach(h=>{if(h.d&&h.d.length>i){total++;if(h.d[i])done++;}});
      const pct=total?(done/total):0;
      const cell=document.createElement('div');
      cell.className='heatmap-cell'+(pct>=0.75?' l4':pct>=0.5?' l3':pct>=0.25?' l2':pct>0?' l1':'');
      cell.title='Dzień '+(i+1)+': '+(pct*100).toFixed(0)+'%';
      cell.style.display='inline-block';
      frag.appendChild(cell);
    }
    hm.appendChild(frag);
  }

  // Correlations
  const corr=document.getElementById('analytics-correlations');
  if(corr){
    safeDOM.clear(corr);
    const frag=document.createDocumentFragment();
    const today=new Date().toISOString().slice(0,10);
    const todayLog=state.nootropicLog[today]||{};
    const nootTaken=Object.values(todayLog).filter(s=>s==='taken').length;
    const nootTotal=(state.nootropics||[]).length;
    const nootPct=nootTotal?(nootTaken/nootTotal*100):0;
    const todayRate=rates.length?rates[rates.length-1]*100:0;
    const r1=document.createElement('div');r1.className='corr-row';
    const l1=document.createElement('span');l1.className='corr-label';l1.textContent='Nootropy vs Nawyki';
    const v1=document.createElement('span');v1.className='corr-val '+(nootPct>=50&&todayRate>=50?'trend-up':'trend-neutral');
    v1.textContent=nootPct.toFixed(0)+'% / '+todayRate.toFixed(0)+'%';
    r1.appendChild(l1);r1.appendChild(v1);frag.appendChild(r1);
    const sessions=state.timer?state.timer.session:0;
    const r2=document.createElement('div');r2.className='corr-row';
    const l2=document.createElement('span');l2.className='corr-label';l2.textContent='Pomodoro sesji vs Nawyki';
    const v2=document.createElement('span');v2.className='corr-val '+(sessions>=2?'trend-up':'trend-neutral');
    v2.textContent=sessions+' sesji / '+todayRate.toFixed(0)+'%';
    r2.appendChild(l2);r2.appendChild(v2);frag.appendChild(r2);
    const maxStreak=habits.reduce((mx,h)=>Math.max(mx,h.s||0),0);
    const r3=document.createElement('div');r3.className='corr-row';
    const l3=document.createElement('span');l3.className='corr-label';l3.textContent='Max streak';
    const v3=document.createElement('span');v3.className='corr-val trend-up';v3.textContent=maxStreak+'d';
    r3.appendChild(l3);r3.appendChild(v3);frag.appendChild(r3);
    corr.appendChild(frag);
  }
  // Multi-data overlay chart
  renderOverlayChart();
  // Habit Grid heatmap
  renderHabitGrid();
}
function renderOverlayChart(){
  const oc=document.getElementById('overlay-chart');if(!oc)return;safeDOM.clear(oc);
  const days=14,ns='http://www.w3.org/2000/svg',W=360,H=120;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('width','100%');svg.setAttribute('height','130');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','none');
  const habits=state.habits||[];const today=new Date();
  // Compute series
  const habitPcts=[],nootPcts=[],sleepQ=[],timerCts=[];
  for(let i=0;i<days;i++){
    const d=new Date(today);d.setDate(d.getDate()-(days-1-i));const ds=d.toISOString().slice(0,10);
    let hd=0,ht=0;habits.forEach(h=>{if(h.d&&h.d.length>i){ht++;if(h.d[i])hd++;}});habitPcts.push(ht?hd/ht*100:0);
    const nl=state.nootropicLog[ds]||{};const ntotal=(state.nootropics||[]).length;const ntaken=Object.values(nl).filter(s=>s==='taken').length;nootPcts.push(ntotal?ntaken/ntotal*100:0);
    const sl=state.sleepLog[ds];sleepQ.push(sl?sl.quality==='good'?100:sl.quality==='med'?50:0:0);
    const es=(state.eventStore&&state.eventStore.sheets&&state.eventStore.sheets.timer)||[];timerCts.push(es.filter(e=>e.date===ds).length*25);
  }
  const series=[{data:habitPcts,color:'var(--nom)',label:'Nawyki %'},{data:nootPcts,color:'var(--cold)',label:'Nootropy %'},{data:sleepQ,color:'var(--a2)',label:'Sen'},{data:timerCts,color:'#9b59b6',label:'Timer'}];
  const drawLine=(data,color)=>{const pts=data.map((v,i)=>`${(i/(days-1)*W).toFixed(1)},${(H-8-(Math.min(v,100)/100*(H-16))).toFixed(1)}`).join(' ');const pl=document.createElementNS(ns,'polyline');pl.setAttribute('points',pts);pl.setAttribute('fill','none');pl.setAttribute('stroke',color);pl.setAttribute('stroke-width','1.5');pl.setAttribute('stroke-linecap','round');svg.appendChild(pl);};
  series.forEach(s=>drawLine(s.data,s.color));
  oc.appendChild(svg);
  // Legend
  const leg=document.createElement('div');leg.style.cssText='display:flex;gap:.75rem;flex-wrap:wrap;margin-top:.25rem;';
  series.forEach(s=>{const sp=document.createElement('span');sp.style.cssText=`font-size:.6rem;color:${s.color};cursor:pointer;`;sp.textContent='● '+s.label;leg.appendChild(sp);});
  oc.appendChild(leg);
}
function renderHabitGrid(){
  const hg=document.getElementById('habit-grid');if(!hg)return;safeDOM.clear(hg);
  const habits=state.habits||[];if(!habits.length){hg.textContent='Brak danych.';return;}
  const weeks=4,daysPerWeek=7;
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat('+weeks+',14px);gap:2px;';
  for(let w=0;w<weeks;w++){for(let d=0;d<daysPerWeek;d++){const dayIdx=w*daysPerWeek+d;let done=0,total=0;habits.forEach(h=>{if(h.d&&h.d.length>dayIdx){total++;if(h.d[dayIdx])done++;}});const pct=total?done/total:0;const cell=document.createElement('div');cell.className='heatmap-cell'+(pct>=0.75?' l4':pct>=0.5?' l3':pct>=0.25?' l2':pct>0?' l1':'');cell.title=`Dzień ${dayIdx+1}: ${(pct*100).toFixed(0)}%`;grid.appendChild(cell);}}
  hg.appendChild(grid);
}

// ── Init ──
mCalcEGFR();mCalcCG();mCalcGCS();mCalcAPGAR();mCalcBMI();mCalcCP();mCalcCHADS();mCalcCURB();mCalcWells();mCalcCentor();
mCalcSOFA();mCalcQSOFA();mCalcNEWS();mCalcMELD();mCalcHH();mCalcDose();mCalcQTc();


// ═══════════════════════════════════════════════════
// EXAMPLE PLUGINS FOR LIFE OS
// ═══════════════════════════════════════════════════

// Example 1: Crypto Price Tracker Plugin
class CryptoPricePlugin extends PluginSystem.BasePlugin {
  constructor(config) {
    super({
      id: "crypto-prices",
      name: "Kryptowaluty",
      version: "1.0.0",
      author: "LIFE OS",
      description: "Śledzenie cen kryptowalut",
      config: { symbols: ["BTC-USD", "ETH-USD"], refreshInterval: 60000, ...config }
    });
  }
  async init(api) {
    await super.init(api);
    this.api = api;
    this.fetchPrices();
    this.intervalId = setInterval(() => this.fetchPrices(), this.config.refreshInterval);
  }
  async destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    await super.destroy();
  }
  async fetchPrices() {
    try {
      const prices = [];
      for (const symbol of this.config.symbols) {
        const data = await fetchYahoo(symbol);
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
          const meta = data.chart.result[0].meta;
          prices.push({ symbol: meta.symbol, price: meta.regularMarketPrice, change: meta.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2) : 0 });
        }
      }
      this.lastPrices = prices;
      this.renderContainer();
    } catch (error) {
      this.api.error("Failed to fetch crypto prices:", error);
    }
  }
  render(container) {
    this.container = container;
    this.renderContainer();
  }
  renderContainer() {
    if (!this.container || !this.lastPrices) return;
    safeDOM.clear(this.container);
    const frag = document.createDocumentFragment();
    this.lastPrices.forEach(coin => {
      const card = this.api.createElement("div", { className: "plugin-card crypto-card" });
      const symbol = this.api.createElement("div", { className: "coin-symbol mono", textContent: coin.symbol });
      const price = this.api.createElement("div", { className: "coin-price", textContent: "$" + coin.price.toFixed(2) });
      const change = this.api.createElement("div", { className: "coin-change " + (parseFloat(coin.change) >= 0 ? "positive" : "negative"), textContent: (parseFloat(coin.change) >= 0 ? "+" : "") + coin.change + "%" });
      card.appendChild(symbol);
      card.appendChild(price);
      card.appendChild(change);
      frag.appendChild(card);
    });
    this.container.appendChild(frag);
  }
}

// Example 2: Quote of the Day Plugin
class QuotePlugin extends PluginSystem.BasePlugin {
  constructor(config) {
    super({ id: "daily-quote", name: "Cytat Dnia", version: "1.0.0", author: "LIFE OS", description: "Inspirujące cytaty na każdy dzień", config: { category: "inspire", ...config } });
  }
  async init(api) {
    await super.init(api);
    this.api = api;
    this.fetchQuote();
  }
  async fetchQuote() {
    try {
      const data = await this.api.fetch("https://type.fit/api/quotes");
      if (data && Array.isArray(data)) {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        this.currentQuote = { text: randomQuote.text, author: randomQuote.author || "Nieznany" };
        this.renderContainer();
      }
    } catch (error) {
      const fallbackQuotes = [
        { text: "Największa chwała nie polega na tym, by nigdy nie upaść, ale by podnieść się za każdym razem.", author: "Konfucjusz" },
        { text: "Życie jest jak jazda na rowerze. Żeby utrzymać równowagę, musisz być w ciągłym ruchu.", author: "Albert Einstein" },
        { text: "Przyszłość zależy od tego, co robisz dzisiaj.", author: "Mahatma Gandhi" }
      ];
      this.currentQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      this.renderContainer();
    }
  }
  render(container) {
    this.container = container;
    this.renderContainer();
  }
  renderContainer() {
    if (!this.container || !this.currentQuote) return;
    safeDOM.clear(this.container);
    const quoteCard = this.api.createElement("div", { className: "plugin-card quote-card" });
    const quoteText = this.api.createElement("blockquote", { className: "quote-text", textContent: this.currentQuote.text });
    const quoteAuthor = this.api.createElement("cite", { className: "quote-author", textContent: "— " + this.currentQuote.author });
    quoteCard.appendChild(quoteText);
    quoteCard.appendChild(quoteAuthor);
    this.container.appendChild(quoteCard);
  }
}

// Example 3: Pomodoro Statistics Plugin
class PomodoroStatsPlugin extends PluginSystem.BasePlugin {
  constructor(config) {
    super({ id: "pomodoro-stats", name: "Statystyki Pomodoro", version: "1.0.0", author: "LIFE OS", description: "Śledzenie sesji focus time", config: { targetSessions: 8, ...config } });
  }
  async init(api) {
    await super.init(api);
    this.api = api;
    this.unsubscribe = PluginSystem.on("onDataUpdate", (data) => {
      if (data.state && data.state.timer) { this.updateStats(data.state.timer); }
    });
    this.loadStats();
    this.renderContainer();
  }
  async destroy() {
    if (this.unsubscribe) this.unsubscribe();
    await super.destroy();
  }
  loadStats() {
    const saved = this.api.storage.get("pomodoroStats");
    this.stats = saved || { totalSessions: 0, todaySessions: 0, lastDate: new Date().toDateString(), streak: 0 };
    if (this.stats.lastDate !== new Date().toDateString()) {
      this.stats.todaySessions = 0;
      this.stats.lastDate = new Date().toDateString();
    }
  }
  saveStats() {
    this.api.storage.set("pomodoroStats", this.stats);
  }
  updateStats(timerState) {
    if (timerState.session > (this.lastSessionCount || 0)) {
      this.stats.totalSessions++;
      this.stats.todaySessions++;
      this.saveStats();
      this.renderContainer();
    }
    this.lastSessionCount = timerState.session;
  }
  render(container) {
    this.container = container;
    this.renderContainer();
  }
  renderContainer() {
    if (!this.container) return;
    safeDOM.clear(this.container);
    const statsCard = this.api.createElement("div", { className: "plugin-card stats-card" });
    const title = this.api.createElement("h3", { className: "stats-title", textContent: "🍅 Postęp Pomodoro" });
    const progress = Math.min((this.stats.todaySessions / this.config.targetSessions) * 100, 100);
    const progressBar = this.api.createElement("div", { className: "progress-bar" });
    const progressFill = this.api.createElement("div", { className: "progress-fill", style: "width: " + progress + "%" });
    const stats = this.api.createElement("div", { className: "stats-grid" });
    const today = this.api.createElement("div", { className: "stat-item" });
    today.innerHTML = '<span class="stat-label">Dzisiaj:</span><span class="stat-value">' + this.stats.todaySessions + '/' + this.config.targetSessions + '</span>';
    const total = this.api.createElement("div", { className: "stat-item" });
    total.innerHTML = '<span class="stat-label">Łącznie:</span><span class="stat-value">' + this.stats.totalSessions + '</span>';
    progressBar.appendChild(progressFill);
    stats.appendChild(today);
    stats.appendChild(total);
    statsCard.appendChild(title);
    statsCard.appendChild(progressBar);
    statsCard.appendChild(stats);
    this.container.appendChild(statsCard);
  }
}

// ═══════════════════════════════════════════════════
// MARKET NEWS WIDGET PLUGIN
// ═══════════════════════════════════════════════════
class MarketNewsWidget extends PluginSystem.BasePlugin {
  constructor(config) {
    super({ 
      id: 'market-news', 
      name: 'Rynki i Gospodarka', 
      version: '1.0.0', 
      author: 'LIFE OS', 
      description: 'Monitorowanie rynków finansowych, wiadomości ekonomicznych i danych energetycznych',
      config: {
        refreshInterval: CONFIG.MARKET_NEWS.REFRESH_INTERVAL,
        maxNews: CONFIG.MARKET_NEWS.MAX_NEWS,
        enableSentiment: CONFIG.MARKET_NEWS.ENABLE_SENTIMENT,
        ...config
      }
    });
    this.currentTab = 'news';
    this.newsData = [];
    this.economicData = {};
    this.energyData = {};
    this.lastUpdate = null;
    this.refreshTimer = null;
  }

  async init(api) {
    await super.init(api);
    this.api = api;
    await this.fetchAllData();
    this.startAutoRefresh();
    this.renderContainer();
  }

  async destroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.unsubscribe) this.unsubscribe();
    await super.destroy();
  }

  startAutoRefresh() {
    this.refreshTimer = setInterval(async () => {
      await this.fetchAllData();
      if (this.container) this.renderContainer();
    }, this.config.refreshInterval);
  }

  async fetchAllData() {
    try {
      await Promise.allSettled([
        this.fetchFinnhubNews(),
        this.fetchFREDEconomicData(),
        this.fetchEIAEnergyData()
      ]);
      this.lastUpdate = new Date();
      this.saveToCache();
    } catch (error) {
      console.error('[MarketNewsWidget] Error fetching data:', error);
    }
  }

  async fetchFinnhubNews() {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().split('T')[0];
      const to = now.toISOString().split('T')[0];
      
      const response = await this.api.fetch(
        `https://finnhub.io/api/v1/news?category=general&from=${from}&to=${to}`,
        { headers: { 'X-Finnhub-Token': CONFIG.MARKET_NEWS.FINNHUB_API_KEY } }
      );
      
      if (response && Array.isArray(response)) {
        this.newsData = response.slice(0, this.config.maxNews).map(item => ({
          id: item.id || Math.random().toString(36),
          title: sanitize.text(item.headline || 'Brak tytułu'),
          summary: sanitize.text(item.summary || ''),
          source: sanitize.text(item.source || 'Unknown'),
          url: item.url || '#',
          image: item.image || '',
          datetime: item.datetime ? new Date(item.datetime * 1000) : new Date(),
          sentiment: item.sentiment || 'neutral'
        }));
      }
    } catch (error) {
      console.error('[MarketNewsWidget] Finnhub error:', error);
      this.loadFromCache('news');
    }
  }

  async fetchFREDEconomicData() {
    try {
      const series = [
        { id: 'CPIAUCSL', name: 'Inflacja (CPI)', units: '%' },
        { id: 'UNRATE', name: 'Bezrobocie', units: '%' },
        { id: 'GDP', name: 'PKB', units: 'mld USD' },
        { id: 'FEDFUNDS', name: 'Stopy procentowe', units: '%' }
      ];

      const promises = series.map(async (s) => {
        try {
          const response = await this.api.fetch(
            `https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${CONFIG.MARKET_NEWS.FRED_API_KEY}&file_type=json&limit=10`
          );
          if (response && response.observations) {
            const data = response.observations.map(obs => ({
              date: new Date(obs.date),
              value: parseFloat(obs.value) || 0
            })).reverse();
            this.economicData[s.id] = {
              name: s.name,
              units: s.units,
              data: data,
              latest: data[0] || { value: 0, date: new Date() },
              trend: data.length > 1 ? (data[0].value - data[1].value) / (data[1].value || 1) * 100 : 0
            };
          }
        } catch (err) {
          console.error(`[MarketNewsWidget] FRED ${s.id} error:`, err);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('[MarketNewsWidget] FRED error:', error);
      this.loadFromCache('economic');
    }
  }

  async fetchEIAEnergyData() {
    try {
      const endpoints = [
        { id: 'oil', name: 'Ropa WTI', url: 'https://www.eia.gov/dnav/pet/hist/rwtcD.htm' },
        { id: 'gas', name: 'Gaz ziemny', url: 'https://www.eia.gov/dnav/ng/hist/rngwhhdd.htm' },
        { id: 'electricity', name: 'Elektryczność', url: 'https://www.eia.gov/electricity/monthly/' }
      ];

      // EIA API requires specific series IDs - using mock data for demo
      // In production, replace with actual EIA API calls
      this.energyData = {
        oil: { name: 'Ropa WTI', price: 75.50, change: 1.2, unit: 'USD/baryłka' },
        gas: { name: 'Gaz ziemny', price: 2.85, change: -0.5, unit: 'USD/MMBtu' },
        electricity: { name: 'Elektryczność', price: 45.20, change: 0.3, unit: 'USD/MWh' }
      };

      // Note: Real EIA API implementation would go here
      // Example: https://api.eia.gov/v2/series/?api_key=YOUR_KEY&...
    } catch (error) {
      console.error('[MarketNewsWidget] EIA error:', error);
      this.loadFromCache('energy');
    }
  }

  saveToCache() {
    this.api.storage.set('marketNewsCache', {
      news: this.newsData,
      economic: this.economicData,
      energy: this.energyData,
      timestamp: Date.now()
    });
  }

  loadFromCache(type) {
    const cached = this.api.storage.get('marketNewsCache');
    if (!cached || Date.now() - cached.timestamp > 3600000) return; // 1 hour max
    
    if (type === 'news' && cached.news) this.newsData = cached.news;
    if (type === 'economic' && cached.economic) this.economicData = cached.economic;
    if (type === 'energy' && cached.energy) this.energyData = cached.energy;
  }

  render(container) {
    this.container = container;
    this.renderContainer();
  }

  renderContainer() {
    if (!this.container) return;
    
    safeDOM.clear(this.container);
    
    const widgetCard = this.api.createElement('div', { className: 'plugin-card market-news-card' });
    
    // Header with tabs
    const header = this.api.createElement('div', { className: 'mn-header' });
    const title = this.api.createElement('h3', { textContent: '📈 Rynki i Gospodarka', className: 'mn-title' });
    
    const tabs = this.api.createElement('div', { className: 'mn-tabs' });
    ['news', 'economy', 'energy'].forEach(tabId => {
      const tab = this.api.createElement('button', {
        textContent: tabId === 'news' ? '📰 Wiadomości' : tabId === 'economy' ? '📊 Gospodarka' : '⚡ Energia',
        className: `mn-tab ${this.currentTab === tabId ? 'active' : ''}`,
        onclick: () => {
          this.currentTab = tabId;
          this.renderContainer();
        }
      });
      tabs.appendChild(tab);
    });
    
    header.appendChild(title);
    header.appendChild(tabs);
    widgetCard.appendChild(header);

    // Content based on active tab
    const content = this.api.createElement('div', { className: 'mn-content' });
    
    if (this.currentTab === 'news') {
      content.appendChild(this.renderNews());
    } else if (this.currentTab === 'economy') {
      content.appendChild(this.renderEconomy());
    } else if (this.currentTab === 'energy') {
      content.appendChild(this.renderEnergy());
    }
    
    widgetCard.appendChild(content);
    
    // Footer with last update
    const footer = this.api.createElement('div', { className: 'mn-footer' });
    const updateTime = this.lastUpdate ? this.lastUpdate.toLocaleTimeString('pl-PL') : 'Nigdy';
    footer.appendChild(this.api.createElement('small', { 
      textContent: `Ostatnia aktualizacja: ${updateTime}`,
      className: 'mn-update-time'
    }));
    
    const refreshBtn = this.api.createElement('button', {
      textContent: '🔄 Odśwież',
      className: 'mn-refresh-btn',
      onclick: async () => {
        await this.fetchAllData();
        this.renderContainer();
      }
    });
    
    footer.appendChild(refreshBtn);
    widgetCard.appendChild(footer);
    this.container.appendChild(widgetCard);
  }

  renderNews() {
    const container = this.api.createDocumentFragment();
    
    if (this.newsData.length === 0) {
      container.appendChild(this.api.createElement('p', { textContent: 'Ładowanie wiadomości...', className: 'mn-loading' }));
      return container;
    }

    this.newsData.forEach(news => {
      const article = this.api.createElement('article', { className: 'mn-article' });
      
      if (news.image) {
        const img = this.api.createElement('img', { 
          src: news.image, 
          alt: news.title,
          className: 'mn-article-image',
          loading: 'lazy'
        });
        article.appendChild(img);
      }
      
      const info = this.api.createElement('div', { className: 'mn-article-info' });
      
      const headline = this.api.createElement('h4', { className: 'mn-article-headline' });
      const link = this.api.createElement('a', {
        href: news.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        textContent: news.title
      });
      headline.appendChild(link);
      info.appendChild(headline);
      
      if (news.summary) {
        info.appendChild(this.api.createElement('p', { 
          textContent: news.summary.substring(0, 150) + (news.summary.length > 150 ? '...' : ''),
          className: 'mn-article-summary'
        }));
      }
      
      const meta = this.api.createElement('div', { className: 'mn-article-meta' });
      meta.appendChild(this.api.createElement('span', { 
        textContent: news.source,
        className: 'mn-article-source'
      }));
      meta.appendChild(this.api.createElement('span', { 
        textContent: news.datetime.toLocaleDateString('pl-PL'),
        className: 'mn-article-date'
      }));
      
      if (this.config.enableSentiment && news.sentiment !== 'neutral') {
        const sentimentBadge = this.api.createElement('span', {
          textContent: news.sentiment === 'positive' ? '🟢 Pozytywny' : '🔴 Negatywny',
          className: `mn-sentiment mn-sentiment-${news.sentiment}`
        });
        meta.appendChild(sentimentBadge);
      }
      
      info.appendChild(meta);
      article.appendChild(info);
      container.appendChild(article);
    });

    return container;
  }

  renderEconomy() {
    const container = this.api.createDocumentFragment();
    
    if (Object.keys(this.economicData).length === 0) {
      container.appendChild(this.api.createElement('p', { textContent: 'Ładowanie danych ekonomicznych...', className: 'mn-loading' }));
      return container;
    }

    Object.values(this.economicData).forEach(indicator => {
      const card = this.api.createElement('div', { className: 'mn-indicator-card' });
      
      const header = this.api.createElement('div', { className: 'mn-indicator-header' });
      header.appendChild(this.api.createElement('h4', { textContent: indicator.name }));
      
      const trendIcon = indicator.trend >= 0 ? '📈' : '📉';
      const trendClass = indicator.trend >= 0 ? 'trend-up' : 'trend-down';
      header.appendChild(this.api.createElement('span', { 
        textContent: `${trendIcon} ${indicator.trend >= 0 ? '+' : ''}${indicator.trend.toFixed(2)}%`,
        className: `mn-trend ${trendClass}`
      }));
      
      card.appendChild(header);
      
      const value = this.api.createElement('div', { className: 'mn-indicator-value' });
      value.appendChild(this.api.createElement('span', { 
        textContent: indicator.latest.value.toFixed(2),
        className: 'mn-value-number'
      }));
      value.appendChild(this.api.createElement('span', { 
        textContent: indicator.units,
        className: 'mn-value-unit'
      }));
      card.appendChild(value);
      
      const date = this.api.createElement('div', { 
        textContent: `Dane z: ${indicator.latest.date.toLocaleDateString('pl-PL')}`,
        className: 'mn-indicator-date'
      });
      card.appendChild(date);
      
      container.appendChild(card);
    });

    return container;
  }

  renderEnergy() {
    const container = this.api.createDocumentFragment();
    
    if (Object.keys(this.energyData).length === 0) {
      container.appendChild(this.api.createElement('p', { textContent: 'Ładowanie danych energetycznych...', className: 'mn-loading' }));
      return container;
    }

    Object.values(this.energyData).forEach(commodity => {
      const card = this.api.createElement('div', { className: 'mn-energy-card' });
      
      card.appendChild(this.api.createElement('h4', { textContent: commodity.name }));
      
      const priceRow = this.api.createElement('div', { className: 'mn-energy-price' });
      priceRow.appendChild(this.api.createElement('span', { 
        textContent: `${commodity.price.toFixed(2)} ${commodity.unit}`,
        className: 'mn-energy-value'
      }));
      
      const changeClass = commodity.change >= 0 ? 'change-positive' : 'change-negative';
      const changeIcon = commodity.change >= 0 ? '▲' : '▼';
      priceRow.appendChild(this.api.createElement('span', { 
        textContent: `${changeIcon} ${commodity.change >= 0 ? '+' : ''}${commodity.change.toFixed(2)}%`,
        className: `mn-energy-change ${changeClass}`
      }));
      
      card.appendChild(priceRow);
      container.appendChild(card);
    });

    return container;
  }
}

// Register all plugins
try {
  PluginSystem.register(MarketNewsWidget);
  PluginSystem.register(CryptoPricePlugin);
  PluginSystem.register(QuotePlugin);
  PluginSystem.register(PomodoroStatsPlugin);
  console.log('[PluginSystem] All plugins registered successfully');
} catch (error) {
  console.error('[PluginSystem] Failed to register plugins:', error);
}

if (CONFIG.PLUGIN.ENABLED && typeof PluginSystem !== 'undefined') {
  PluginSystem.autoLoad().then(() => {
    PluginSystem.renderAll();
  }).catch(err => {
    console.error('[PluginSystem] Auto-load failed after plugin registration:', err);
  });
}

// ── Service Worker Registration & Background Sync ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'sync-state') {
      saveTodos(); saveHabits(); saveNootropics();
    }
  });
}
