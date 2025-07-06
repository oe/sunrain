# Astro 心理健康网站国际化/本地化设计方案

## 多语言页面组织及路由路径策略

**文件结构与路由前缀：** 基于 Astro 的文件系统路由，我们为每种语言创建对应的页面目录。例如，支持英文（en）、简体中文（zh）、西班牙语（es）、日语（ja）、韩语（ko）、印地语（hi）、阿拉伯语（ar）等语言时，可在 `src/pages/` 下建立 `/en/`、`/zh/`、`/es/`、`/ja/` 等文件夹，每个文件夹下包含各语言的页面文件。这些文件夹名称需与配置的语言代码完全一致。Astro 会自动根据文件结构生成对应的带语言前缀的 URL 路由，例如 `src/pages/en/about.astro` -> `/en/about/`。需要注意默认语言是否使用前缀：

* **默认语言前缀配置：** 在 Astro 配置(`astro.config.mjs`)中通过 `i18n` 选项指定支持的语言和默认语言。例如：

  ```js
  export default defineConfig({
    i18n: {
      locales: ["en", "zh", "es", "ja", "ko", "hi", "ar"],  // 支持的语言代码
      defaultLocale: "zh",  // 默认语言（如中文为主站语言）
      routing: {
        prefixDefaultLocale: false  // 默认语言不使用前缀
      }
    }
  });
  ```

  上述配置表示默认语言为中文且不在 URL 中添加 `/zh` 前缀。此时中文页面文件放在 `src/pages/` 根目录，而其他语言放在各自子目录中；例如 `src/pages/about.astro` 生成 `/about/`，`src/pages/en/about.astro` 生成 `/en/about/`。如果希望所有语言包括默认语言都带前缀（如统一使用 `/en/`, `/zh/`），可设置 `prefixDefaultLocale: true`，并将默认语言内容也置于对应文件夹下。这种情况下，没有前缀的 URL 将返回 404，需通过 fallback 策略处理。本方案推荐 `prefixDefaultLocale: false`（默认语言无前缀）以保持主语言路径简洁，同时其他语言使用清晰的前缀区分。

**页面结构和逻辑复用：** 为避免为每种语言重复开发页面组件，我们应最大程度复用页面结构和逻辑。具体做法是将可复用的布局和组件抽取出来，页面主要区别在于文案内容。举例来说，可以创建一个通用的页面组件或布局，然后在不同语言的页面中引入相同的布局，仅填入不同语言的内容。Astro 4.x 也支持**动态路由**方式处理多语言：可以使用一个动态参数文件夹（例如 `src/pages/[locale]/`）来统一处理不同语言的路由，在该文件夹下编写单一的页面逻辑，通过 `getStaticPaths` 生成各语言页面。这样 `[locale]` 作为占位符会在构建时被替换为实际语言代码，避免重复编写多份页面代码。在此模式下，可以根据 `Astro.params.locale` 或 Astro 提供的 `Astro.currentLocale` 来加载对应语言的内容。无论采用独立目录还是动态路由方案，都要确保页面模版和组件是可重用的，仅根据当前语言切换内容和局部差异，从而降低维护成本。

**浏览器语言自动识别及默认路由：** 为提升用户体验，网站应实现访问根域名时根据浏览器偏好语言自动导航到相应语言版本。有两种方案：

* **静态站点方案：** 在根路径的 `src/pages/index.astro` 中实现重定向逻辑。可以利用 `<meta http-equiv="refresh">` 标签立即将用户重定向到默认语言首页（例如 `<meta http-equiv="refresh" content="0; url=/zh/" />` 重定向到中文首页)。为实现智能检测，可在该页插入一段脚本读取浏览器的 `navigator.language` 或 `Accept-Language`，匹配支持语言列表后执行 `window.location` 跳转到对应语言路径。例如，根据用户浏览器语言判断应跳转 `/en/`或`/es/`等。如果未匹配到支持的语言，则跳转到默认语言。由于纯静态无法在服务端识别请求头，这种前端脚本方案是必要的补充。**注意**：当提供手动语言切换时，可以使用 `localStorage` 或 Cookie 保存用户选择，前端脚本应优先检查用户曾经选择的语言以尊重其偏好，避免每次都强制根据浏览器语言重定向。
* **SSR/中间件方案（可选）：** 如果部署Astro站点时使用了SSR适配器（例如 Node 或 Vercel），可以在服务器中利用 Astro 的 `Astro.preferredLocale` 属性或编写自定义中间件，根据 `Accept-Language` 请求头判定用户优先语言并返回重定向响应。Astro 内置的国际化中间件支持 `redirectToDefaultLocale` 配置，当启用并使用前缀时，会自动将根路径重定向到默认语言路径（但默认是跳转到预设的 defaultLocale，而非浏览器偏好）。为实现按浏览器语言跳转，需要自定义 `routing: "manual"` 模式，在 `onRequest` 中通过 `Astro.preferredLocale` 判断并重定向到对应路径。这种方式在静态生成架构下通常不可用，因此我们以静态方案为主，配合少量前端脚本实现自动语言识别。

总之，站点将采用「默认语言直达根路径、其他语言使用 `/lang/` 前缀」的URL策略。用户首次访问根路径时会根据其语言偏好定向到对应语言版页面，同时提供清晰的URL结构便于SEO和用户理解。

## 内容翻译与存储方案

**多语言内容存储：** 网站的文字内容主要通过自动翻译生成，各语言版本应与源码内容分离存储。推荐将可本地化的内容拆分为**内容文件**和**界面文案**两部分：

* **Markdown 内容文件：** 对于文章、故事、博客帖子等富文本内容，每种语言维护一套 Markdown 文件。可以使用 Astro 的 Content Collections 功能组织多语言内容：在 `src/content/` 下按内容类型建立文件夹，并在其下按语言划分子目录。例如建立 `src/content/stories/` 存放投稿故事内容，里面有 `en/`、`zh/`、`es/` 等子文件夹，各自包含该语言的 Markdown 文件。每个内容条目（如某篇故事）在不同语言的文件名保持一致。例如 `src/content/stories/zh/story1.md` 和 `src/content/stories/en/story1.md` 分别是同一故事的中英文版本。通过 Astro content collections，可以方便地按语言读取内容集合。初始内容以某种语言为源（例如中文），其它语言的 Markdown 可通过自动翻译生成。\*\*自动翻译流程：\*\*内容作者在源语言创作或更新 Markdown 后，通过脚本或CI流程调用翻译API（DeepL、Google Translate等）将其翻译成其他目标语言，并将译文填充到相应语言目录的 Markdown 文件中。这样所有语言都有静态的内容文件，便于 Astro 构建时直接引用，且翻译结果可根据需要进行人工润色后保存在仓库中。

* **界面文本与文案：** 网站导航、按钮标签、表单提示等UI字符串可以集中管理。建议在源码中建立一个国际化字典文件，例如 `src/i18n/ui.ts`，定义一个 `ui` 对象，包含各语言的文本映射。例如：

  ```ts
  export const ui = {
    en: { "nav.home": "Home", "nav.about": "About", "submit": "Submit Story", ... },
    zh: { "nav.home": "首页", "nav.about": "关于", "submit": "投稿故事", ... },
    // ... 其他语言
  } as const;
  ```

  这样所有界面用词都有对应翻译，开发时通过键值引用，避免散落在代码中难以维护。

**自动翻译与人工校对并行：** 自动翻译生成内容时，需考虑人工调整的工作流。推荐的做法是**以源语言内容为单一真源**，由脚本自动更新其他语言文件，但提供机制保留人工修改：

* **翻译工作流：** 使用 GitHub Actions 等CI工具监听内容仓库的更新。当源语言 Markdown 改动或新增时，触发脚本调用翻译API，将新增或变动的文本翻译成各目标语言。脚本应智能化：例如只翻译尚未有译文的部分或自上次翻译后源文更新过的部分，减少重复翻译开销。翻译后将 Markdown 文件写入对应语言目录并由CI自动提交回仓库。这一步可以借助翻译服务提供的SDK/库，也可直接HTTP请求 API。
* **人工调整与保护：** 对于自动翻译质量不佳的重要内容，人工可以直接编辑翻译后的 Markdown 文件进行润色。在下次自动翻译时，为避免覆盖人工修改，可引入**内容标记或时间戳比对**机制。比如在译文文件的 frontmatter 中添加标记字段（如 `manual: true` 或译文更新时间），让翻译脚本跳过有人工标记的段落或文件，或仅在源文更新时间晚于译文修改时间时才重新翻译。这样既能持续利用自动翻译减少工作量，又能保留人工改进成果。

**“投稿故事”内容的特殊处理：** 对于某些内容板块（如“投稿故事”页面），不同语言共享相同的用户投稿内容，不根据语言划分独立版本，只是在展示时提供翻译结果。设计上，可采取以下策略：

* **单一内容来源：** 将投稿故事作为一套独立于语言的内容集合管理。例如所有用户故事都用提交时的语言保存到同一列表（可能采用统一语言存储或标记每条故事的语言）。假设主要投稿以中文为主，那么就以中文保存故事内容。

* **多语言显示：** 在各语言站点中显示这些故事时，根据当前语言对内容进行翻译。实现方式可以有两种：其一，**构建时翻译**：在 Astro 构建生成各语言页面时，对这些故事内容调用翻译API，将其翻译成页面对应语言并静态注入页面。这样最终生成的静态页面在不同语言目录下都有相同故事的译文。其二，**前端动态翻译**（不太建议SSG场景）：利用浏览器的翻译组件或Ajax请求翻译服务在前端翻译。但考虑SEO和纯静态需求，构建时翻译更可取。为了配合构建翻译，可以将投稿内容纳入上述CI翻译流程：例如每当有新投稿收录，就触发脚本为各语言预生成译文缓存，存入对应语言的内容文件或JSON数据。这些译文也可允许人工调整，以免机翻歧义。

* **页面实现：** “投稿故事”页面本身可以只实现一套逻辑，不针对语言区别对待。比如创建 `src/pages/stories.astro`（默认语言页面）或结合动态路由 `[locale]/stories.astro`，页面组件中读取所有投稿故事数据（无需按语言过滤），对于当前语言环境，如果预先有对应译文则直接显示，没有则临时调用翻译函数。由于我们倾向于预生成译文，实际页面渲染时可统一从多语言内容集合中读取当前语言字段。如果某故事没有对应语言版本，可退回显示原文或提示仅提供原文。这种方式确保投稿内容库维护一份，减少重复劳动，并通过自动翻译让各语言用户都能读懂。

通过以上方案，网站内容管理做到**源内容一处编辑，翻译结果自动铺设**。多语言 Markdown 文件既支持静态生成，又方便版本控制，结合自动化流程极大降低维护成本。

## 本地化组件封装与使用

为方便在组件和页面中使用正确的本地化文本，我们需要封装统一的本地化取词机制。可以设计两种形式：**钩子函数** 或 **UI组件**。

**获取当前语言环境：** 在 Astro 组件或页面中，可以通过上下文获取当前页面语言。例如 Astro 4 提供了 `Astro.currentLocale` 来获取根据URL解析出的语言代码。如果不使用内置值，也可通过对 `Astro.url.pathname` 做解析来提取语言段。如封装一个工具函数：

```ts
export function getLocaleFromPath(path: string): string {
  const segments = path.split('/');
  return (segments[1] && supportedLocales.includes(segments[1])) ? segments[1] : defaultLocale;
}
```

Astro 官方示例也是通过URL路径拆分来确定语言。使用 Astro 内置 i18n 时，上述逻辑也可直接使用 `Astro.currentLocale` 简化实现。

**钩子函数 useLocale/useTranslations：** 我们可以定义一个类似 React Hook 的辅助，在 Astro 中用普通函数实现即可。例如：

```ts
export function useTranslations(locale: string) {
  return function t(key: string) {
    return ui[locale][key] || ui[defaultLocale][key];
  }
}
```

其中 `ui` 是前述定义的字典对象，`defaultLocale` 是默认语言。调用 `useTranslations(lang)` 会返回一个取字符串的函数 `t(key)`，在给定语言不存在该键时自动回退到默认语言。在页面或组件中，先获取当前语言代码，例如：

```astro
---
import { getLocaleFromPath, useTranslations } from '../i18n/utils';
const lang = getLocaleFromPath(Astro.url.pathname);
const t = useTranslations(lang);
---
<button>{t('submit')}</button>
```

这样即可根据当前语言渲染出对应的按钮文本（例如中文环境下 `t('submit')` 返回“投稿故事”，英文环境返回“Submit Story”）。

**LocalizedText 组件：** 另一种方式是封装一个 `<LocalizedText key="..."/>` 组件。该组件内部同样通过上下文或属性知道当前语言，并从全局字典中取对应的文本返回。示例：

```astro
---
// LocalizedText.astro
import { useTranslations } from '../i18n/utils';
const lang = Astro.props.locale; // 或从全局context获取
const t = useTranslations(lang);
const { id } = Astro.props;
---
{t(id)}
```

使用时可以 `<LocalizedText locale={lang} id="nav.home" />` 得到导航的本地化标题。“locale”可缺省从上层提供，比如通过 Astro 提供的 `Astro.currentLocale` 或布局属性传入。这种组件封装有利于在模板中直接书写标签而非调用函数，开发者可根据团队习惯选择。但需要注意Astro模板自身不像React有Context，可以简单地在每层传递当前语言或使用Astro提供的工具函数获取。

**本地化表单与日期格式：** 除文本外，一些数据如时间/数字格式也要本地化处理。例如日期可以使用JS的 `toLocaleString(lang)` 根据语言格式化。建议封装诸如 `formatDate(date, locale)` 等工具函数，统一处理不同语言的日期格式、右至左语言支持等特殊情况。样式方面，如遇到阿拉伯语等RTL语言，也需在CSS或页面容器上加 `dir="rtl"` 属性或相应CSS。

通过统一的本地化组件/函数封装，开发者在编写页面时无需关心具体语言实现，只需调用取词函数或组件，即可在不同语言环境下呈现正确的文字。这种设计降低了出错概率，增加了代码可读性。例如在导航组件中使用：

```astro
<a href={`/${lang}/about/`}>{t('nav.about')}</a>
```

即可确保文字和链接都切换到当前语言。

## 语言切换器的实现方式

网站应提供显著的界面让用户手动切换语言。通常在页眉或页脚放置语言选单。实现语言切换器需要考虑以下几点：

**语言列表与显示：** 使用前述定义的 `languages` 映射，提供语言代码到名称的对照。例如：

```ts
export const languages = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية'
};
```

切换器可以是下拉菜单或直接的列表链接。例如实现一个 `<LanguagePicker>` 组件，遍历 `languages` 对象输出列表：

```astro
<ul>
  {Object.entries(languages).map(([lang, label]) => (
    <li><a href={`/${lang}/`}>{label}</a></li>
  ))}
</ul>
```

这样会生成到各语言首页的链接。放置该组件于站点全局布局的合适位置（如footer）即可让每页都显示切换器。为避免无意中的完整页面刷新，也可用 `<select>` 下拉配合简单的JS onChange事件修改 location.pathname 来实现切换；但由于我们是在静态页面间切换，使用普通链接已足够且对SEO友好。

**保持当前页面上下文：** 理想情况下，当用户在某一内容页切换语言时，应跳转到对应内容的目标语言页面，而非一律回到首页。如果所有语言都有对应路径且内容已翻译，这可以通过构造对应链接实现。例如当前URL为 `/zh/guide/start`，切换到英文时应跳转 `/en/guide/start`。我们可以利用Astro提供的 `getRelativeLocaleUrl(locale, path)` 助函数来计算某一相对路径在指定语言下的URL。或者自行对当前路径做字符串替换：取当前URL去除开头的语言段，再拼接新的语言前缀。Astro文档提供了封装的 `useTranslatedPath()` 工具，可传入目标语言代码和当前路径，返回对应语言的路径，默认会处理默认语言无前缀等情况。实现上，可在 LanguagePicker 中先获取当前访问路径（除去开头`/lang/`部分），然后为每个语言构造链接。例如：

```astro
---
import { getRouteFromUrl, useTranslatedPath } from '../i18n/utils';
const currentRoute = getRouteFromUrl(Astro.url); // 提取当前页面的路由标识（如slug）
---
<ul>
  {Object.entries(languages).map(([code, label]) => {
    const translatePath = useTranslatedPath(code);
    return <li><a href={translatePath(`/${currentRoute || ''}`)}>{label}</a></li>;
  })}
</ul>
```

其中 `getRouteFromUrl` 用于获取当前页面的路由名称（如当前是某文章页，则提取其通用标识），`useTranslatedPath(code)` 返回一个函数，将路径翻译为指定语言路径。如果某页面在目标语言没有对应版本（例如还未翻译），可以让 `getRouteFromUrl` 返回空，使链接指向该语言的首页。这样用户切换语言时至少不会跳到404页面。由于本方案采用自动翻译，大部分页面都会有各语言版本，未翻译页面的情况应很少发生。

**指示当前语言：** 在切换器UI上，可以高亮当前选中的语言，例如将当前语言项用不同样式显示或在下拉中设为选中状态。通过对比当前 `Astro.currentLocale` 与列表语言代码，添加相应标记即可。

**用户选择偏好：** 当用户通过切换器手动选择了语言后，我们可以认为这是用户的语言偏好。为了在下次访问根路径时尊重这一选择（而不总是根据浏览器语言重定向），可以在用户点击切换链接时，在URL跳转的同时利用简单的脚本将所选语言存入 `localStorage` 或 Cookie。例如在切换链接上绑一个点击事件设置`document.cookie="prefLang=en;"`。然后修改前述首页检测脚本逻辑：若检测到用户已存有偏好语言cookie，则优先跳转到该语言，而不使用浏览器语言。【*注：纯静态实现Cookie读取也只能在前端执行跳转，但逻辑上可行*】这样提升用户体验，使语言选择具有持续性。

综上，语言切换器的实现比较直接：利用各语言的首页或对应内容链接实现跳转，搭配UI指示。目前的方案基于静态链接，无需额外的客户端应用逻辑，简单可靠。

## SEO 国际化处理

多语言站点在SEO上需做好规范化和提示搜索引擎不同语言版本之间的关系：

**HTML语言声明：** 每个页面的HTML标签应包含准确的 `lang` 属性。例如中文页面 `<html lang="zh">`，英文页面 `<html lang="en">` 等。这有助于搜索引擎正确索引和用户代理（如浏览器、屏幕阅读器）正确呈现内容。实现上可在页面布局中根据当前语言动态设置此属性（前述我们通过 Base Layout 已经实现）。

**hreflang 标签：** 为避免多语言页面被搜索引擎误判为重复内容，并帮助其向用户展示适合语言的结果，需要在页面中使用 `hreflang` 标签指明各语言版本的对应关系。具体做法是在每个页面的 `<head>` 部分添加 `<link rel="alternate" hreflang="xx" href="...">` 标签列出其他语言的同一内容URL。例如，对于中文页面，可以在头部添加：

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page-path/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page-path/" />
<link rel="alternate" hreflang="zh" href="https://example.com/page-path/" />  <!-- 中文默认无前缀假设 -->
```

如果有地区变体语言，可用区域码如 `zh-CN`，`en-US` 等。Google 等搜索引擎据此了解这些URL是同一内容的不同语言版本。此外，可在首页或主入口加一个 `hreflang="x-default"` 链接指向默认语言版本，表示无特定偏好的通用版本。这在默认语言不带前缀时尤为重要，避免搜索引擎对根URL语种困惑。

**站点地图 (Sitemap) 多语言：** 使用 Astro 官方提供的 `@astrojs/sitemap` 集成，在生成 sitemap.xml 时自动包含多语言链接。通过在 Astro 配置中设置 `site` 属性和 `sitemap({ i18n: {...} })` 选项，可以让插件为每个页面列出所有语言版本的 `<xhtml:link rel="alternate" hreflang="...">` 标签。例如配置：

```js
integrations: [sitemap({
  i18n: {
    defaultLocale: 'zh',
    locales: {
      zh: 'zh-CN', en: 'en-US', es: 'es-ES', ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN', ar: 'ar-SA'
    }
  }
})]
```

生成的 sitemap.xml 中，每个URL条目下都会有对应语言版本的链接标注。搜索引擎可以通过站点地图获取这些关系（事实上，将 hreflang 放在 sitemap 中是被Google支持的做法，可以代替页面内的 link 标记）。为了稳妥，**页面内 hreflang 与 sitemap 均可提供**，确保搜索引擎无论通过哪种途径爬取都能获取完整的语言版本信息。

**其他SEO细节：** 确保每个语言页面都有本语言的Meta标题和描述等内容。这意味着在Markdown内容或页面frontmatter中为各语言维护对应的 `<title>`、`<meta name="description">` 文本。自动翻译流程应覆盖这些SEO字段的翻译。`<html lang>` 已设置正确语言，另外如涉及多语言URL的`canonical`标签应该指向自身或主版本，避免权重分散。使用Google Search Console等工具提交各语言的站点地图，有助于快速索引。

通过正确设置语言标记和提供多语言sitemap，能让搜索引擎理解本站的国际化结构，提升不同地区用户搜索可见性，避免因内容重复而被降权。这对心理健康内容在全球传播非常关键。

## 自动翻译工作流集成建议

为了实现内容的自动翻译和持续更新，需建立一套与代码仓库集成的自动化流程：

**CI/CD 翻译流水线：** 使用 GitHub Actions 等持续集成工具，在内容变更时触发翻译。具体步骤如下：

1. **触发条件：** 当仓库中源语言内容（例如 `content/zh/` 下文件）有新的提交或 Pull Request 合并时，触发一个翻译工作流程。
2. **提取变更内容：** 在 CI 中运行一个脚本，扫描源内容的改动部分。可以通过 git diff 找出哪些 Markdown 文件新增或修改。为了高效，也可以借助内容集合索引，仅处理没有对应译文文件或源文件更新时间晚于译文文件的项。
3. **调用翻译API：** 针对每个需要翻译的内容，调用外部翻译服务。可以使用官方SDK或REST API。例如调用 DeepL API 将 Markdown 文本从中文翻译为英文、西班牙语等；Google Cloud Translate 也可用类似方式。需注意段落内保留 Markdown 语法（可分段翻译文本部分，避免代码/标记被破坏）。对于长文，可以逐段翻译并重组。
4. **生成译文文件：** 将翻译结果填入对应语言的 Markdown 模板中。通常可以复制源文件的 frontmatter（如标题、日期等）到译文，替换其中的可翻译字段和正文内容为译文。如果 frontmatter 里有语言相关字段（如 `lang: zh`），修改为目标语言码。保存文件到 `content/{lang}/` 对应路径下。如果目录不存在则创建。
5. **提交更新：** 使用 GitHub Actions 的权限，将新生成或更新的译文文件提交回仓库（可以push到同一分支）。这一步可以自动化，从而让翻译结果进入版本管理。为避免循环触发，提交时可配置跳过再次触发CI的条件（例如 `[skip ci]` 标记）。
6. **通知或审核：** 可选地，在PR中标记这些翻译更新，让内容管理员审阅。如有问题可手动修改后再次提交。

**翻译秘钥管理：** 将翻译API的密钥配置为CI的机密变量，切勿明文写入仓库。CI脚本读取这些变量来认证API请求。注意控制调用频率和并发，避免超出API限额或产生高额费用。可以针对批量翻译做速率限制或使用翻译缓存（如相同段落不重复翻译）。

**版本控制与回滚：** 由于所有译文都在Git管理下，如果出现翻译不当或错误，可以通过Git回滚特定提交快速恢复之前版本。内容团队也可以通过PR的形式对译文进行修改，修改后的内容在后续流程中通过标记避免被再次覆盖。

**多人协作与平台：** 如果内容量大且需要人工校对，考虑引入专业的翻译平台集成（例如 Crowdin、Locize 等）作为扩展。在此方案中，可定期将源内容推送到平台进行机器翻译和人工润色，再从平台拉取译文更新到仓库。但鉴于题目要求主要自动翻译，这里以直接使用API为主。

**示例工作流文件 (GitHub Actions YAML)**：

```yaml
on:
  push:
    paths:
      - "src/content/zh/**"    # 监控中文内容变化
jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run translation script
        env:
          DEEPL_KEY: ${{ secrets.DEEPL_API_KEY }}
        run: node scripts/translate.js
      - name: Commit translations
        run: |
          git config user.name "translator-bot"
          git config user.email "translator@example.com"
          git add src/content/**
          git commit -m "Auto-translated new content [skip ci]" || echo "No changes to commit"
          git push
```

上面的流程假设有一个 `scripts/translate.js` Node脚本实现翻译逻辑，并将结果保存。

**质量监控：** 定期人工抽查译文质量，重点页面人工润色后打上“人工已校对”标识，避免后续自动流程反复翻译覆盖。对于新增加的语言，可先用机器批量翻译初始内容，再由母语工作人员整体审核一轮，然后再交由上述流程增量维护。

通过CI集成自动翻译，我们能够**实时拓展内容的多语言覆盖**。每当有新文章发布或现有内容更新，几分钟之内各语言版本即可同步更新，保证网站内容的一致性和及时性。这种工作流非常适合SSG架构下的多语言站点，实现内容与翻译代码的持续交付，让心理健康网站可以低成本地服务全球用户。

**参考文献：**

* Astro 官方文档: 国际化路由和多语言站点实践等
* Astro 官方文档: 内容集合与动态路由实现多语言内容
* Astro 官方文档: 界面文案翻译工具示例
* Astro 官方文档: 实现语言切换器和路由切换示例
* Google SEO 文档: hreflang 标签的作用与格式（Weglot 指南）
* Astro Sitemap 集成: 自动生成多语言站点地图及示例
