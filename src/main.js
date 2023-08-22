import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import 'lazysizes'

const app = createApp(App)
app.use(router)
app.use(ViewUIPlus)

router.isReady().then(() => app.mount("#app"));
