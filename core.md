# 核心功能

## 安裝

Livewire 2.x基本需求

* PHP 7.2.5以上版本
* Laravel 7.0以上版本

可參考[這裡](https://github.com/livewire/livewire/blob/master/composer.json)的composer.json檔案來瞭解完整的依賴套件內容

### 下載套件

`composer require livewire/livewire`

### 載入素材

將以下的Blade指令加在會用到Livewire的頁面之head和body標籤內，去載入JS和CSS檔案

```
<html>
<head>
    ...
    @livewireStyles
</head>
<body>
    ...
    @livewireScripts
</body>
</html>
```

你也可以改用以下的版本，結果相同

```
<livewire:styles />
...
<livewire:scripts />
```

> 簡單吧，現在你就可以開始使用Livewire囉，其他以下的動作都是非必須的


### 發布設定檔案(非必須)

Livewire朝向零設定檔的架構來設計，但或許你會希望能夠更多的設定空間。你可以使用以下命令來將Livewire設定檔加入專案中

`php artisan livewire:publish --config`

### 發布前端素材(非必須)

假如你希望JS前端素材不要透過Laravel來取得，而是透過像public這樣的開放資料夾，可以使用 livewire:publish 命令

`php artisan livewire:publish --assets`

為了確保素材能即時更新以避免後續更新造成的問題，強烈建議加入以下命令到 composer.json檔案內的 post-autoload-dump腳本中

```
{
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi",
            "@php artisan vendor:publish --force --tag=livewire:assets --ansi"
        ]
    }
}
```

### 設定素材基礎網址(非必須)

預設來說，Livewire所需要使用的JS檔案(livewire.js)，是透過這個路由來取得的:/livewire/livewire.js

之前的Blade指令將會生成這樣的完整內容

`<script src="/livewire/livewire.js"></script>`

有兩種狀況將會導致這個JS檔案無法正常取得

1.你發布了Livewire前端素材並將之放入一個子資料夾，比如"assets"
2.你的應用不是佈署於網域的根路徑，比如`your-laravel-app.com/application`。在這種狀況下JS檔案路徑將變成 /application/livewire/livewire.js，但負責生成的Blade指令依然會生成路徑為/livewire/livewire.js

為了解決上兩種狀況的問題，你能夠在config/livewire.php設定檔中去設定 "asset_base_url" 來調整src屬性裏頭的內容

也就是說，你需要發布livewire設定檔，並修改以下內容:

```
'asset_base_url' => '/assets'
'asset_base_url' => '/application'
```

## 建立組件

執行以下命令來建立一個新的Livewire組件

`php artisan make:livewire ShowPosts`

Livewire同樣支援以中橫線的方式來命名組件

`php artisan make:livewire show-posts`

接著將會有兩個檔案在專案內生成

app/Http/Livewire/ShowPosts.php
resources/views/livewire/show-posts.blade.php

假如你希望能在子資料夾內去建立組件，你能夠使用以下這些語法，我個人較為偏好點語法，比較不用去記線條方向

```
php artisan make:livewire Post\\Show
php artisan make:livewire Post/Show
php artisan make:livewire post.show
```

這樣的話，組件檔案就會生成在子資料夾內囉

```
app/Http/Livewire/Post/Show.php
resources/views/livewire/post/show.blade.php
```

### Inline 組件

假如你希望能建立的是Inline組件，白話說就是將視圖內容直接寫在類別中而省去blade檔案。你能夠加入 --inline選項到命令中

`php artisan make:livewire ShowPosts --inline`

這樣的話，就只會生成單一的檔案囉

app/Http/Livewire/ShowPosts.php

內容就會像是這個樣子:

```
class ShowPosts extends Component
{
    public function render()
    {
        return <<<'blade'
            <div></div>
        blade;
    }
}
```
---

## 渲染組件

### 加入組件

最簡單加入組建的方式，就是使用`<livewire:組件名稱>`標籤

```
<div>
    <livewire:show-posts />
</div>
```

或者也可以使用 Blade 的 @livewire 指令

`@livewire('show-posts')`

假如組件是放在子資料夾內，你可以在名字前加上.來說明其完整的命名空間為何，類似這樣

`<livewire:nav.show-posts />`


### 傳入參數

你能夠透過傳入額外參數到`<livewire:>`標籤內來達到傳遞資料的目的

舉例來說，我們有一個 show-post 組件，你能夠這樣寫來傳入 $post 模型

`<livewire:show-post :post="$post">`

如果是 Blade 指令的版本，則可以這樣寫

`@livewire('show-post', ['post' => $post])`

### 接收參數

Livewire將會自動將參數分配給同名的屬性，比如像剛才的例子，假如 show-post 組件有一個名為 $post 的屬性，它將會被自動的賦值

```
class ShowPost extends Component
{
    public $post;

    ...
}
```

假如因未知原因自動賦值失敗的話，你還是可以透過 mount() 來自己完成賦值

```
class ShowPost extends Component
{
    public $title;
    public $content;

    public function mount($post)
    {
        $this->title = $post->title;
        $this->content = $post->content;
    }

    ...
}
```

>注意
>
>在 Livewire 組件中，你應該使用 mount() 而非建構子 __construct() 來完成屬性的初始化工作

就如同控制器一樣，你能夠利用型別提示的依賴注入技巧在參數上

```
use \Illuminate\Session\SessionManager;

class ShowPost extends Component
{
    public $title;
    public $content;

    public function mount(SessionManager $session, $post)
    {
        $session->put("post.{$post->id}.last_viewed", now());

        $this->title = $post->title;
        $this->content = $post->content;
    }

    ...
}
```

### 全頁組件

假如整個頁面就是一個 Livewire 組件，你能夠在路由規則上直接傳入組件，將之當作控制器使用

```
//routes\web.php

Route::get('/post', ShowPosts::class);
```

預設， Livewire 將會渲染 ShowPosts 組件的內容到 {{ $slot }}，預設視圖為 resources/views/layouts/app.blade.php

```
<head>
    @livewireStyles
</head>
<body>
    {{ $slot }}

    @livewireScripts
</body>
```

### 調整組件的Layout

假如你想要改用其他視圖檔案而非預設的 layouts/app.blade.php，你能夠複寫 livewire.layout 設定檔的選項

`'layout' => 'app.other_default_layout'`

如果你希望動態的調整而不透過設定，你能夠在 render() 後面接著使用 layout()

```
class ShowPosts extends Component
{
    ...
    public function render()
    {
        return view('livewire.show-posts')
            ->layout('layouts.base');
    }
}
```

假如你使用的不是預設的組件插槽，你能夠接著呼叫 slot()

```
public function render()
{
    return view('livewire.show-posts')
        ->layout('layouts.base')
        ->slot('main');
}
```

當然，Livewire 1.x所使用的傳統 Blade layout語法還是管用的，你依然可以使用 @extends，假如父視圖像這樣:

```
<head>
    @livewireStyles
</head>
<body>
    @yield('content')

    @livewireScripts
</body>
```

你就需要把 layout() 改成使用 extends()

```
public function render()
{
    return view('livewire.show-posts')
        ->extends('layouts.app');
}
```

假如你需要指定組件所要渲染的 section 為何，你能夠透過 section() 來加以指定

```
public function render()
{
    return view('livewire.show-posts')
        ->extends('layouts.app')
        ->section('body');
}
```

假如你需要從組件類別將資料傳入 layout ，你能夠接著呼叫 layout()，並透過其第二參數來傳遞資料

```
public function render()
{
    return view('livewire.show-posts')
        ->layout('layouts.base', ['title' => 'Show Posts'])
}
```

### 路徑參數

一般你需要在控制器方法中去取用路徑參數，因為我們不再使用控制器，Livewire試著去模擬一個類似的行為，透過 mount()，像這個例子:

```
//routes\web.php

Route::get('/post/{id}', ShowPost::class);
```

```
//app\Http\Livewire\ShowPost.php

class ShowPost extends Component
{
    public $post;

    public function mount($id)
    {
        $this->post = Post::find($id);
    }

    ...
}
```

你看， mount() 在組件中就扮演著類似控制器方法的腳色，同樣可以取用路徑參數。假如你訪問 /post/123， $id 參數傳入 mount() 將會包含123這個值

### Route Model Binding

就如同我們期待的，Laravel方便的 Route Model Binding 同樣的在 Livewire 能夠使用，做法也都一樣

```
//routes\web.php

Route::get('/post/{post}', ShowPost::class);
```

```
//app\Http\Livewire\ShowPost.php

class ShowPost extends Component
{
    public $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }
}
```

假如你用的是 PHP 7.4或以上版本，你還能夠針對類別屬性做型別提示，Livewire也會自動地幫你進行 Route Model Binding。比如下面組件的 $post 屬性將會被自動注入，在 mount() 內不需要做任何事情

```
//app\Http\Livewire\ShowPost.php

class ShowPost extends Component
{
    public Post $post;
}
```
---

### render()

Livewire 組件的 render() 會在頁面初次載入的時候被呼叫。假如是很簡單的組件，你就不需要自己定義 render()，基礎的 Livewire 根組件就包含了一個動態的 render()

#### 回傳 Blade 視圖

在 render() 內被預期要回傳一個 Blade 視圖，因此，你能夠將之比做是一個控制器方法，下面是一個例子:

> 注意
> 
> 請務必確認你的 Blade 視圖內只有一個根元素，以免出現錯誤

```
class ShowPosts extends Component
{
    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Post::all(),
        ]);
    }
}

//resources/views/livewire/show-posts.blade.php
<div>
    @foreach ($posts as $post)
        @include('includes.post', $post)
    @endforeach
</div>
```

#### 回傳佈局字串

除了回傳 Blade 視圖檔案，假如內容簡單的話，也可以在 render() 直接回傳一個包含 Blade 佈局的字串

```
class DeletePost extends Component
{
    public Post $post;

    public function delete()
    {
        $this->post->delete();
    }

    public function render()
    {
        return <<<'blade'
            <div>
                <button wire:click="delete">Delete Post</button>
            </div>
        blade;
    }
}
```

> 像這樣不需要搭配 Blade 視圖的組件，如果需要生成的話，可以加入 --inline選項，像這樣 php artisan make:livewire delete-post --inline

---

## 屬性

### 介紹

Livewire 組件是透過組件類別裡的公開屬性來存取資料

```
class HelloWorld extends Component
{
    public $message = 'Hello World!';
    ...
```

Livewire 類別的公開屬性將自動的能夠在視圖內去取用，而不需要你自己去將它們手動傳入到視圖中，但是如果你喜歡的話也是可以自己來

```
//Livewire類別

class HelloWorld extends Component
{
    public $message = 'Hello World!';
}

//視圖檔案中

<div>
    <h1>{{ $message }}</h1>
    <!-- Will output "Hello World!" -->
</div>
```

### 重要事項

關於公開屬性有幾點重要的事情你需要知道:

1.屬性名稱請避開Livewire的保留字，比如:rules以及messages
2.存在 public 屬性的資料將會對前端JS開放，因此請勿儲存敏感的資料
3.屬性只能夠儲存JS所支持的資料型態，比如(string.int.array.boolean)，又或者是以下的PHP型別（Stringable, Collection, DateTime, Model, EloquentCollection）

> protected 以及 private 屬性將不會在 Livewire更新的時候保存，所以請避免在這些屬性裡頭去儲存狀態

### 初始化屬性

你能夠透過組件的 mount() 來進行屬性的初始化

```
class HelloWorld extends Component
{
    public $message;

    public function mount()
    {
        $this->message = 'Hello World!';
    }
}
```

假如你覺得逐一的進行屬性賦值太醜，你也可以改用 $this->fill() 來做

```
public function mount()
{
    $this->fill(['message' => 'Hello World!']);
}
```

除此之外，Livewire也提供了 $this->reset() 來幫助你重設公開屬性的值，這在你執行完某些操作需要重置屬性值的時候很有用

```
public $search = '';
public $isActive = true;

public function resetFilters()
{
    $this->reset('search');
    重置 search 屬性

    $this->reset(['search', 'isActive']);
    重置 search 和 isActive 屬性
}
```

### 資料綁定

假如你用過前端框架像是 Vue 或是 Angular，你應該就已經熟悉MVVM的觀念了。然而如果你不是太理解的話，資料綁定就是 Livewire 能夠綁定組件的公開屬性到某些 HTML 元素的屬性上，當變更屬性時，這些元素的屬性也會跟著異動

```
組件類別
class HelloWorld extends Component
{
    public $message;
}

組件視圖
<div>
    <input wire:model="message" type="text">

    <h1>{{ $message }}</h1>
</div>
```

像這個例子，當使用者在輸入項輸入內容，就會很神奇的發現下面的H1標籤內容跟著異動，就像是魔法一樣，就是資料綁定的效果

它的原理是，Livewire將會監聽元素的輸入事件，當觸發時，就會發出一個 AJAX請求，取得新資料之後再重新渲染該組件視圖

你能夠加入 wire:model 到任何會派發 input 事件的元素。哪怕是自定義元素甚至是第三方 JS 函式庫都可以

一般能使用 wire:model 的元素包含以下這些:

* <input type="text">
* <input type="radio">
* <input type="checkbox">
* <select>
* <textarea>

### 綁定巢狀資料

Livewire 支持綁定陣列裡頭的巢狀資料，透過點語法的方式

`<input type="text" wire:model="parent.message">`

### 取消延遲輸入 Debouncing Input

預設 Livewire 會採用一個 150ms 的文字輸入延遲以避免當使用者在輸入文字時產生過多的網頁請求

假如你想要覆寫此預設行為，Livewire提供你一個名為 "debounce" 的修飾字，假如你想要將輸入項的延遲時間改為0.5秒，你可以加入這個修飾字像這樣:

`<input type="text" wire:model.debounce.500ms="name">`

### Lazy Updating

預設 Livewire會在每一個輸入事件觸發之後發出請求，這對於像下拉選單這種輸入項不至於發出過快或過多的請求就沒啥問題。然而對於文字輸入項的話就沒有必要這麼頻繁了

在這種情況下，使用 lazy 修飾字來限定監聽 change 事件

`<input type="text" wire:model.lazy="message">`

現在的 $message 屬性將只會在使用者點到其他的輸入項導致觸發 change事件時才會被更新

### Deferred Updating

假如你不需要資料被同步的更新，只需要跟著下一次的網頁請求再做更新的話，Livewire提供了 .defer 修飾字來滿足你的需求，下面是一個例子:

```
<input type="text" wire:model.defer="query">
<button wire:click="search">Search</button>
```

當使用者輸入內容到文字輸入項將不會有任何網路請求被發出，儘管使用者點到其他輸入項來觸發 change 事件也一樣

但當使用者按下 Search 按鈕，Livewire將發出一個網路請求，同時包含新的查詢狀態.以及 Search 行為

這將大幅度的縮減不必要的網路使用量

### 直接綁定到模型屬性

假如一個 Eloquent 模型被作為公開屬性儲存在 Livewire 組件，你能夠直接綁定它，這是一個例子:

```
use App\Post;

class PostForm extends Component
{
    public Post $post;

    protected $rules = [
        'post.title' => 'required|string|min:6',
        'post.content' => 'required|string|max:500',
    ];

    public function save()
    {
        $this->validate();

        $this->post->save();
    }
}
```
```
<form wire:submit.prevent="save">
    <input type="text" wire:model="post.title">

    <textarea wire:model="post.content"></textarea>

    <button type="submit">Save</button>
</form>
```
注意到視圖有直接綁定到模型的 "title" 以及 "content" 屬性，Livewire將會為你搞定模型的解構與重構等工作

> 注意
> 
> 有注意到一個名為 $rules 的屬性嗎，你必須定義每一個模型屬性的驗證規則，否則將會跳出錯誤。你甚至可以在Eloquent集合裡去綁定模型


```
use App\Post;

class PostForm extends Component
{
    public $posts;

    protected $rules = [
        'posts.*.title' => 'required|string|min:6',
        'posts.*.content' => 'required|string|max:500',
    ];

    public function mount()
    {
        $this->posts = auth()->user()->posts;
    }

    public function save()
    {
        $this->validate();

        foreach ($this->posts as $post) {
            $post->save();
        }
    }
}
```
```
<form wire:submit.prevent="save">
    @foreach ($posts as $index => $post)
        <div wire:key="post-field-{{ $post->id }}">
            <input type="text" wire:model="posts.{{ $index }}.title">

            <textarea wire:model="posts.{{ $index }}.content"></textarea>
        </div>
    @endforeach

    <button type="submit">Save</button>
</form>
```

#### 計算屬性

Livewire 提供一個用來取用動態屬性的API，這特別適合用於取用來自於資料庫或者是快取的內容

```
class ShowPost extends Component
{
    // Computed Property
    public function getPostProperty()
    {
        return Post::find($this->postId);
    }
```

現在，你可以從組件類別或視圖中去取用 $this->post

```
class ShowPost extends Component
{
    public $postId;

    public function getPostProperty()
    {
        return Post::find($this->postId);
    }

    public function deletePost()
    {
        $this->post->delete();
    }
}
```
```
<div>
    <h1>{{ $this->post->title }}</h1>
    ...
    <button wire:click="deletePost">Delete Post</button>
</div>
```

計算屬性會作為單獨的Livewire請求生命週期來進行快取，也就是說，假如你在Blade視圖呼叫 $this->post 五次之後，它將不會再對資料庫進行查詢而是從快取中取出 


## 行動

### 簡介

Livewire 裡頭行動的目的是輕鬆的偵聽頁面的互動，並且呼叫你組件裡的方法，比如用來重新渲染組件

這是一個簡單的用法:

```
class ShowPost extends Component
{
    public Post $post;

    public function like()
    {
        $this->post->addLikeBy(auth()->user());
    }
}
```
```
<div>
    <button wire:click="like">Like Post</button>
</div>
```
Livewire當前提供一個好用的語法來讓偵聽瀏覽器事件變得更為簡單，它們的一般格式為： wire:[發送瀏覽器事件]="[action]"

下面是一些比較常會需要偵聽的事件:


| 事件 | 語法 |
| -------- | -------- |
| click     | wire:click     |
| keydown    | wire:keydown     |
| submit     | wire:submit     |

下面是一些HTML上的例子

```
<button wire:click="doSomething">Do Something</button>
<input wire:keydown.enter="doSomething">
<form wire:submit.prevent="save">
    ...

    <button>Save</button>
</form>
```

你能夠真聽任何被你綁定的元素所派發的事件。比如你有一個元素所派發的瀏覽器事件稱為 "foo"，你就能夠用這個語法來偵聽那個事件
`<button wire:foo="someAction">`

### 發送行動參數

你能夠發送額外的參數到 Livewire 行動內，透過以下的語句

```
<button wire:click="addTodo({{ $todo->id }}, '{{ $todo->name }}')">
    Add Todo
</button>
```

額外的參數發送到行動將會透過組件的方法，作為標準的 PHP 參數來傳入

```
public function addTodo($id, $name)
{
    ...
}
```

當然，行動參數也支援型別提示來進行解析

```
public function addTodo(Todo $todo, $name)
{
    ...
}
```

因此假如你的行動需要任何服務需要被 Laravel 的依賴注入容器進行解析，你能夠將類別名稱作為簽名寫在參數的前面

```
public function addTodo(TodoService $todoService, $id, $name)
{
    ...
}
```

### 事件修飾子

剛在 keydown 這個例子中有用到， Livewire 語句可結合修飾子來達到額外的事件功能，下面列出一些能夠被用任何事件的修飾子



| 修飾子 | 描述 |
| -------- | -------- | 
| stop | 等同於 event.stopPropagation() | 
| prevent | 等同於 event.preventDefault() | 
| self | 只有在事件被自己觸發時才會派發行動，以避免外部元素抓取到子元素的事件 | 
| debounce.150ms | 加入額外的指定延遲來處理行動 | 

Keydown 修飾子

為了偵聽 keydown 事件的指定按鍵，你能夠傳入按鍵名稱作為修飾子。你能夠直接透過 KeyboardEvent.key 作為修飾子來使用任何有效的按鍵名稱，以 kebab-case 的命名方式

以下列出一些較為常用的按鍵



| 原生瀏覽器事件 | Livewire修飾子 |
| -------- | -------- | 
| Backspace     | backspace     | 
| Escape     | backspace     | 
| Shift     | shift     | 
| Tab     | tab     | 
| ArrowRight     | arrow-right     | 

`<input wire:keydown.page-down="foo">`

在上面的例子裡頭，處理器將只有在按鍵為 'PageDown' 時才被呼叫

### 魔術方法

在 Livewire 裡頭存在著一些魔術方法，名稱通常帶有錢符號作為前綴:



| 方法 | 描述 |
| -------- | -------- | 
| $refresh | 將重新渲染組件而不需要發送任何行動 | 
| $set('property', value)     | 更新屬性值的語法糖 |
| $toggle('property')     | 切換布林屬性值的語法糖     |
| $emit('event', ...params)     | 發送事件，可帶參數     |
| $event     | 一個特殊的變數保存著觸發行動的事件實體     |

用法: wire:change="setSomeProperty($event.target.value)"

你能夠傳入這些作為事件偵聽器的值來做一些特別的事

就舉 $set() 來說，這能讓你用來手動設定組件屬性的值，比如下面是一個計數器組件的視圖

```
之前寫法

<div>
    {{ $message }}
    <button wire:click="setMessageToHello">Say Hi</button>
</div>

新寫法

<div>
    {{ $message }}
    <button wire:click="$set('message', 'Hello')">Say Hi</button>
</div>
```

注意到嗎? 我們不再需要呼叫 setMessageToHello() ， 而是直接進行設值 ，一切變得更為直覺

## 事件

Livewire 組件們能夠透過全域事件系統來進行溝通。只要兩個 Livewire 組件位在同一個頁面，它們就能透過事件和偵聽器來溝通

### 發送事件

這裡有多種方法能從 Livewire 組件去發送事件

方法 1: 從視圖

`<button wire:click="$emit('postAdded')">`

方法 2: 從組件方法

`$this->emit('postAdded');`

方法 3: 從全域JS函式

```
<script>
    Livewire.emit('postAdded')
</script>
```

### 事件偵聽器

事件偵聽器為註冊於你的 Livewire組件內的 $listeners 屬性

事件偵聽器是以鍵值對的形式，鍵為所要偵聽的事件，而值則是要呼叫的組件方法

```
class ShowPosts extends Component
{
    public $postCount;

    protected $listeners = ['postAdded' => 'incrementPostCount'];

    public function incrementPostCount()
    {
        $this->postCount = Post::count();
    }
}
```

當其他同一頁面的組件發出一個 postAdded 事件，這個組件將會抓取該事件並呼叫自己的 incrementPostCount()

> 如果事件名稱與方法名稱相同的話，你可以只寫鍵即可。比如 protected $listeners = ['postAdded'];

假如你需要偵聽動態事件名，也就是根據不同狀況偵聽對應名稱，你可以拿掉組件的 $listeners 屬性並改以 getListeners() 來達到

```
class ShowPosts extends Component
{
    public $postCount;

    protected function getListeners()
    {
        return ['postAdded' => 'incrementPostCount'];
    }

    ...
}
```

### 傳送參數

你也能夠在發送事件時附帶參數

發送端

`$this->emit('postAdded', $post->id);`

接收端

```
class ShowPosts extends Component
{
    public $postCount;
    public $recentlyAddedPost;

    protected $listeners = ['postAdded'];

    public function postAdded(Post $post)
    {
        $this->postCount = Post::count();
        $this->recentlyAddedPost = $post;
    }
}
```

### 事件域

#### Scoping To Parent Listeners

當處理巢狀組件時，有時你只想要發送事件到父組件，但跳過子組件或者是兄弟組件。這時候 emitUp() 就派上用場了

```
$this->emitUp('postAdded');
<button wire:click="$emitUp('postAdded')">
```

#### Scoping To Components By Name

有時候你只想要發送一個事件到相同類型的其他組件，這時候 emitTo() 就派上用場了
Sometimes you may only want to emit an event to other components of the same type.

```
$this->emitTo('counter', 'postAdded');
<button wire:click="$emitTo('counter', 'postAdded')">
```

現在當按鈕被按下時， "postAdded" 事件將只會被發送給 counter 組件

#### Scoping To Self

有時候你只想要發送一個事件給自己，這時候 emitSelf() 就派上用場了

```
$this->emitSelf('postAdded');
<button wire:click="$emitSelf('postAdded')">
```

現在當按鈕被按下時，"postAdded" 事件將只會被發送給發出事件的自己

### 在JS裡頭去偵聽事件

Livewire 允許你在 JS 裡去註冊事件偵聽器，像這樣:

```
<script>
Livewire.on('postAdded', postId => {
    alert('A post was added with the id of: ' + postId);
})
</script>
```

這個特色是極為強大的。比如當Livewire執行某些任務時在你的應用跳出一個 popup 視窗。這是其中一種透過Livewire用來橋接 PHP 與 JS的技巧 


### 派發瀏覽器事件

Livewire 允許你去發送瀏覽器視窗事件，像這樣:

`$this->dispatchBrowserEvent('name-updated', ['newName' => $value]);`

接著你就能夠利用 JS 來偵聽這個視窗事件

```
<script>
window.addEventListener('name-updated', event => {
    alert('Name updated to: ' + event.detail.newName);
})
</script>
```

AlpineJS 允許你輕鬆的在HTML裡頭去偵聽這些視窗事件

```
<div x-data="{ open: false }" @name-updated.window="open = false">
    <!-- Modal with a Livewire name update form -->
</div>
```


## 生命週期 Hook

### Class Hook

每個 Livewire 組件都服從一個相同的生命週期，而生命週期函式允許你在組件的各個階段去執行程式碼，又或者是在屬性被更新之前



| 生命週期函式 | 描述 |
| -------- | -------- |
| mount     | 只會執行一次，就在組件被初始化的那一刻，會在 render() 呼叫前 | 
| hydrate     | 在每一個請求時呼叫，就在組件被 hydrated 之後，但會在 action 執行或 render() 呼叫前 | 
| hydrateFoo     | 在名為 $foo 的屬性被 hydrated 之前被呼叫 |
| dehydrate | 在每一個請求時呼叫，就在組件被 dehydrated 之前，但會在 render() 呼叫之後|
| dehydrateFoo     | 在名為 $foo 的屬性被 dehydrated 之前被呼叫 |
| updating |在任何組件上的資料被更新前被呼叫，比如使用 wire:model，而不是直接在PHP程式碼內 |
| updated |在任何組件上的資料被更新後被呼叫，比如使用 wire:model，而不是直接在PHP程式碼內 |
| updatingFoo | 在組件上的$foo屬性更新前被呼叫 |
| updatedFoo |在組件上的$foo屬性更新後被呼叫 |
| updatingFooBar | 在組件上的$foo巢狀屬性更新前被呼叫 |
| updatedFooBar |在組件上的$foo巢狀屬性更新後被呼叫 |

```
class HelloWorld extends Component
{
    public $foo;

    public function mount()
    {
        //
    }

    public function hydrateFoo($value)
    {
        //
    }

    public function dehydrateFoo($value)
    {
        //
    }

    public function hydrate()
    {
        //
    }

    public function dehydrate()
    {
        //
    }

    public function updating($value, $name)
    {
        //
    }

    public function updated($value, $name)
    {
        //
    }

    public function updatingFoo($value)
    {
        //
    }

    public function updatedFoo($value)
    {
        //
    }

    public function updatingFooBar($value)
    {
        //
    }

    public function updatedFooBar($value)
    {
        //
    }
}
```
### Javascript Hooks

Livewire 給你一個在某些事件下去執行 JS 程式的機會

| Hooks | 描述 |
| -------- | -------- | 
| component.initialized     | 當頁面上的組件被 Livewire 初始化時會被呼叫 |
| element.initialized     | 當 Livewire 初始化一個單獨的元素時被呼叫     |
| element.updating     | 當 Livewire 更新一個元素前被呼叫     |
| element.updated     | 當 Livewire 更新一個元素後被呼叫    |
| element.removed     | 當 Livewire 移除一個元素後被呼叫     |
| message.sent     | 當 Livewire 發出一個更新訊息到伺服器時被呼叫     |
| message.failed     | 當訊息發送因不明原因失敗時被呼叫     |
| message.received     | 當一個訊息已經完成旅程，即將在更新DOM樹前呼叫     |
| message.processed     | 當 Livewire 完成發送訊息後所有的旅程作業，包含更新DOM樹之後呼叫     |

```
<script>
    document.addEventListener("DOMContentLoaded", () => {
        Livewire.hook('component.initialized', (component) => {})
        Livewire.hook('element.initialized', (el, component) => {})
        Livewire.hook('element.updating', (fromEl, toEl, component) => {})
        Livewire.hook('element.updated', (el, component) => {})
        Livewire.hook('element.removed', (el, component) => {})
        Livewire.hook('message.sent', (message, component) => {})
        Livewire.hook('message.failed', (message, component) => {})
        Livewire.hook('message.received', (message, component) => {})
        Livewire.hook('message.processed', (message, component) => {})
    });
</script>
```

## 巢狀組件

Livewire 支持 巢狀組件，將組件進行巢狀化是非常強大的功能，但有一些要點需要先言明在先：

巢狀組件能夠從其父組件取得資料參數，然後它們並非像是Vue組件那樣透過 props 來進行互動

Livewire 組件不應該用來將 Blade snippets 切分成多個檔案。因此，究竟要使用載入Blade或者是組件可根據自己喜好

這是一個名為 add-user-note 的巢狀組件，被另一個 Livewire 組件視圖叫用

```
class UserDashboard extends Component
{
    public User $user;
}
```
```
<div>
    <h2>User Details:</h2>
    Name: {{ $user->name }}
    Email: {{ $user->email }}

    <h2>User Notes:</h2>
    <div>
        @livewire('add-user-note', ['user' => $user])
    </div>
</div>
```
Keeping Track Of Components In A Loop

### 在迴圈中持續追蹤組件

就跟 Vue.js 一樣，如果你在迴圈裡頭去渲染組件，Livewire無法去追蹤哪個是哪個。為了解決這個尷尬的狀況，livewire提供了一個特殊的 "key" 語法:

```
<div>
    @foreach ($users as $user)
        @livewire('user-profile', ['user' => $user], key($user->id))
    @endforeach
</div>
```

假如你是 Laravel 7 或以上的版本，你能夠使用 tag 語法

```
<div>
    @foreach ($users as $user)
        <livewire:user-profile :user="$user" :key="$user->id">
    @endforeach
</div>
```

### 在迴圈中的相鄰組件

在某些情況下，你也許會需要在迴圈中找到相鄰組件。這種情況就需要更多的考慮如何使用key值

每一個組件都需要它專屬的key值，但使用以上的方法將會導致相鄰的組件會擁有相同的key，這將導致不可見的問題。為了解決這個問題，你需要確保每一個key都是唯一的，那該怎麼做勒?你可以把組件名稱作為key的前綴，舉例來說:


```
<!-- user-profile component -->
<div>
    //不好的做法，容易導致不同組件有相同的key
    <livewire:user-profile-one :user="$user" :key="$user->id">
    <livewire:user-profile-two :user="$user" :key="$user->id">

    //好的做法
    <livewire:user-profile-one :user="$user" :key="'user-profile-one-'.$user->id">
    <livewire:user-profile-two :user="$user" :key="'user-profile-two-'.$user->id">
</div>
```
