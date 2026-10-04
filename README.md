
```
Environnement_de_traville
├─ .dist
├─ backend
│  ├─ config
│  │  └─ db.js
│  ├─ middleware
│  │  ├─ auth.js
│  │  └─ roles.js
│  ├─ models
│  │  ├─ article.js
│  │  ├─ comment.js
│  │  ├─ history.js
│  │  ├─ notification.js
│  │  ├─ ProductArticle.js
│  │  ├─ user.js
│  │  └─ validation.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ articles.js
│  │  ├─ auth.js
│  │  ├─ comments.js
│  │  ├─ export.js
│  │  ├─ history.js
│  │  ├─ notifications.js
│  │  ├─ stats.js
│  │  └─ validations.js
│  ├─ server.js
│  ├─ services
│  │  ├─ camundaService.js
│  │  ├─ emailService.js
│  │  └─ notificationService.js
│  └─ utils
│     ├─ codegenerator.js
│     └─ roleMapper.js
├─ camunda
│  ├─ REAME.md
│  └─ workflows
│     └─ article_creation_workflow.bpmn
├─ docs
│  ├─ api-documentation.md
│  ├─ architecture.md
│  └─ workflow-diagram.png
└─ frontend
   ├─ .eslintrc.js
   ├─ babel.config.js
   ├─ jsconfig.json
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ favicon.ico
   │  ├─ img
   │  │  └─ icons
   │  │     ├─ icon-128x128.png
   │  │     ├─ icon-144x144.png
   │  │     ├─ icon-152x152.png
   │  │     ├─ icon-192x192.png
   │  │     ├─ icon-384x384.png
   │  │     ├─ icon-512x512.png
   │  │     ├─ icon-72x72.png
   │  │     └─ icon-96x96.png
   │  ├─ index.html
   │  ├─ logoPWA.png
   │  └─ manifest.json
   ├─ README.md
   ├─ src
   │  ├─ App.vue
   │  ├─ assets
   │  │  ├─ images
   │  │  │  ├─ logo-mazraa.png
   │  │  │  └─ logo.svg
   │  │  └─ Styles
   │  │     ├─ global.css
   │  │     └─ variables.css
   │  ├─ components
   │  │  ├─ article
   │  │  │  ├─ ArticleCard.vue
   │  │  │  └─ ValidationCard.vue
   │  │  ├─ articlecard.vue
   │  │  ├─ common
   │  │  │  ├─ Alert.vue
   │  │  │  └─ Loader.vue
   │  │  ├─ ErrorToast.vue
   │  │  ├─ footer.vue
   │  │  ├─ Header.vue
   │  │  ├─ loader.vue
   │  │  ├─ modal.vue
   │  │  ├─ navbar.vue
   │  │  ├─ navbar_new.vue
   │  │  ├─ sidebar.vue
   │  │  └─ validationcard.vue
   │  ├─ main.js
   │  ├─ router
   │  │  └─ index.js
   │  ├─ services
   │  │  ├─ api.js
   │  │  ├─ articleservice.js
   │  │  ├─ authservice.js
   │  │  ├─ commentservice.js
   │  │  ├─ notificationservice.js
   │  │  ├─ productArticleService.js
   │  │  ├─ statsservice.js
   │  │  └─ validationservice.js
   │  ├─ store
   │  │  ├─ index.js
   │  │  └─ modules
   │  │     ├─ articles.js
   │  │     ├─ auth.js
   │  │     ├─ notifications.js
   │  │     ├─ theme.js
   │  │     └─ validations.js
   │  └─ views
   │     ├─ admin
   │     │  └─ AdminDashboard.vue
   │     ├─ articles
   │     │  ├─ articledetails.vue
   │     │  ├─ ArticlesQAD.vue
   │     │  └─ CreateArticle.vue
   │     ├─ auth
   │     │  ├─ login.vue
   │     │  ├─ register.vue
   │     │  └─ ResetPassword.vue
   │     ├─ dashbord
   │     │  └─ dashbord.vue
   │     ├─ Notifications.vue
   │     ├─ Profile.vue
   │     ├─ Settings.vue
   │     └─ validations
   │        ├─ ValidateArticle.vue
   │        ├─ ValidationsByType.vue
   │        └─ ValidationsList.vue
   └─ vue.config.js

```