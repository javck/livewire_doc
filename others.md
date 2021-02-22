# 其他

## 測試

Livewire 提供了一組功能強大的工具來測試你的組件

這是一個 Livewire 組件以及相應的測試，以示範基礎知識

```
class CreatePost extends Component
{
    public $title;

    protected $rules = [
        'title' => 'required',
    ];

    public function create()
    {
        auth()->user()->posts()->create(
            $this->validate()
        );

        return redirect()->to('/posts');
    }
}
```
```
<form wire:submit.prevent="create">
    <input wire:model="title" type="text">

    <button>Create Post</button>
</form>
```
```
class CreatePostTest extends TestCase
{
    /** @test  */
    function can_create_post()
    {
        $this->actingAs(User::factory()->create());

        Livewire::test(CreatePost::class)
            ->set('title', 'foo')
            ->call('create');

        $this->assertTrue(Post::whereTitle('foo')->exists());
    }

    /** @test  */
    function can_set_initial_title()
    {
        $this->actingAs(User::factory()->create());

        Livewire::test(CreatePost::class, ['initialTitle' => 'foo'])
            ->assertSet('title', 'foo');
    }

    /** @test  */
    function title_is_required()
    {
        $this->actingAs(User::factory()->create());

        Livewire::test(CreatePost::class)
            ->set('title', '')
            ->call('create')
            ->assertHasErrors(['title' => 'required']);
    }

    /** @test  */
    function is_redirected_to_posts_page_after_creation()
    {
        $this->actingAs(User::factory()->create());

        Livewire::test(CreatePost::class)
            ->set('title', 'foo')
            ->call('create')
            ->assertRedirect('/posts');
    }
}
```

### 測試組件狀態

Livewire 註冊了方便的 PHPUnit 方法來測試頁面上組件的存在

```
class CreatePostTest extends TestCase
{
    /** @test  */
    function post_creation_page_contains_livewire_component()
    {
        $this->get('/posts/create')->assertSeeLivewire('create-post');
    }

    /** @test  */
    function post_creation_page_doesnt_contain_livewire_component()
    {
        $this->get('/posts/create')->assertDontSeeLivewire('edit-post');
    }
}
```

### 使用查詢字符串參數進行測試

要測試 Livewire 的 $queryString 功能，可以使用 Livewire:: withQueryParams 來測試應用

```
class CreatePostTest extends TestCase
{
    /** @test  */
    function post_creation_page_contains_livewire_component()
    {
        Livewire::withQueryParams(['foo' => 'bar'])
            ->test(ShowFoo::class)
            ->assertSet('foo', 'bar')
            ->assertSee('bar');
    }
}
```
### 所有可用的測試方法

```
Livewire::actingAs($user);
// 在測試中以所提供用戶來進行登入

Livewire::withQueryParams(['foo' => 'bar']);
// 設定查詢參數 foo 為 bar，以供 Livewire 組件的 $queryString 屬性抓取

Livewire::test('foo', ['bar' => $bar]);
// 測試 "foo" 組件，並將 "bar" 設定為參數

->set('foo', 'bar');
// 設定 "foo" 屬性(`public $foo`) 為 "bar"

->call('foo');
// 呼叫 "foo" 方法

->call('foo', 'bar', 'baz');
// Call the "foo" method, and pass the "bar" and "baz" parameters
// 呼叫 "foo" 方法，並傳入 "bar" 和 "baz" 參數

->emit('foo');
// 發送 "foo" 事件

->emit('foo', 'bar', 'baz');
// 發送 "foo" 事件，並傳入 "bar" 和 "baz" 參數

->assertSet('foo', 'bar');
// 確認 "foo" 屬性是否設定為 "bar"，包含計算屬性

->assertNotSet('foo', 'bar');
// 確認 "foo" 屬性是否並未設定為 "bar"，包含計算屬性

->assertPayloadSet('foo', 'bar');
// 確認 由 Livewire 所回傳透過 JavaScript 載入的 "foo" 屬性是否設定為 "bar"

->assertPayloadNotSet('foo', 'bar');
// 確認 由 Livewire 所回傳透過 JavaScript 載入的 "foo" 屬性是否並未設定為 "bar"

->assertViewIs('foo')
// 確認當前渲染的視圖為 "foo"

->assertSee('foo');
// 確認當前組件所渲染的內容是否包含 "foo" 字串

->assertDontSee('foo');
// 確認當前組件所渲染的內容是否並未包含 "foo" 字串

->assertSeeHtml('<h1>foo</h1>');
// 確認當前組件所渲染的HTML內容是否包含'<h1>foo</h1>' 字串

->assertDontSeeHtml('<h1>foo</h1>');
// 確認當前組件所渲染的HTML內容是否並未包含'<h1>foo</h1>' 字串

->assertSeeInOrder(['foo', 'bar']);
// 確認當前組件所渲染的內容中，"foo" 是否出現在 "bar" 之前

->assertSeeHtmlInOrder(['<h1>foo</h1>', '<h1>bar</h1>']);
// 確認當前組件所渲染的HTML內容中，'<h1>foo</h1>' 是否出現在 '<h1>bar</h1>' 之前

->assertEmitted('foo');
// 確認 "foo" 事件是否有發出

->assertEmitted('foo', 'bar', 'baz');
// 確認 "foo" 事件發出時，是否帶 "bar" 和 "baz" 參數

->assertNotEmitted('foo');
// 確認 "foo" 事件是否並未發出

->assertHasErrors('foo');
// 確認 "foo" 屬性是否有驗證錯誤

->assertHasErrors(['foo', 'bar']);
// 確認 "foo" 和 "bar" 屬性是否都有驗證錯誤

->assertHasErrors(['foo' => 'required']);
// 確認 "foo" 屬性是否有必填規則的驗證錯誤

->assertHasErrors(['foo' => ['required', 'min']]);
// 確認 "foo" 屬性是否有必填和最小值等規則的驗證錯誤

->assertHasNoErrors('foo');
// 確認 "foo" 屬性是否並未有驗證錯誤

->assertHasNoErrors(['foo', 'bar']);
// 確認 "foo" 和 "bar" 屬性是否並未有驗證錯誤

->assertNotFound();
// 確認組件所引發的錯誤狀態碼是否為404

->assertRedirect('/some-path');
// Assert that a redirect was triggered from the component
// 確認組件是否觸發轉址到 some-path

->assertUnauthorized();
// 確認組件所引發的錯誤狀態碼是否為401

->assertForbidden();
// 確認組件所引發的錯誤狀態碼是否為403

->assertStatus(500);
// 確認組件所引發的錯誤狀態碼是否為500

->assertDispatchedBrowserEvent('event', $data);
// 確認一個瀏覽器事件是否被組件透過->dispatchBrowserEvent(...))發送
```

## 安全

對於 Livewire 新手來說，這種體驗有些神奇。感覺好像頁面加載時，你的 Livewire 組件位於伺服器上，偵聽來自瀏覽器的更新並實時對其進行響應

這與 Phoenix LiveView 等其他類似工具的工作方式相距不遠

無論 Livewire 感覺如何的相似，它的內部工作方式都有很大不同，各有利弊

Livewire 組件感覺像是有狀態的，但其實完全是無狀態的。伺服器上沒有長時間運行的 Livewire 實例等待瀏覽器進行交互，因此每次交互都是全新的請求與響應

為了更全面地掌握這種概念，讓我們以下面的簡單"計數器"組件來了解

```
class Counter extends Component
{
    public $count = 1;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```
```
<div>
    <h1>{{ $count }}</h1>

    <button wire:click="increment">+</button>
</div>
```

從使用者的角度來看，使用“計數器”的使用者體驗是這樣的：用戶加載頁面，看到數字1，點擊"+"按鈕，現在看到數字2

以下是 Livewire 如何實際工作以實現此效果的流程圖

![](https://i.imgur.com/KS8r6P5.png)

總而言之，當使用者訪問包含計數器組件的頁面時，一個通常的請求會像其他頁面一樣發送到伺服器。該頁面會像任何普通的 Blade 組件一樣呈現計數器的初始視圖，但是除了呈現HTML之外，Livewire還會“dehydrates”或“序列化”組件的狀態（公共屬性）並將其傳遞到前端

現在前端具有組件的狀態，當觸發更新（比如按下“+”按鈕）時，會將請求發送到服務器，包括最近已知的組件狀態。服務器從該狀態“hydrates”或“反序列化”組件並執行任何更新

現在，該組件再次 “dehydrated” 以向瀏覽器提供新呈現的HTML和更新的狀態，以供以後的交互請求使用

這是這些請求期間實際組件生命週期的流程圖

![](https://i.imgur.com/sEYidhH.png)

希望你現在已經更準確的了解關於 Livewire 幕後的工作方式與流程。這將使你能夠更好的找出問題，並了解使用 Livewire 的性能和安全隱患

### 安全檢測

就像你從上面學到的那樣，每個 Livewire 請求都是“無狀態的”，即沒有長時間運行的服務器實例來紀錄狀態。狀態儲存在瀏覽器中，並在請求之間來回傳遞給服務器

由於狀態儲存在瀏覽器中，因此很容易受到前端操縱的影響。如果沒有適當的安全措施，歹徒在兩次請求之間去操縱瀏覽器中組件的狀態並不困難

在我們的計數器例子中，操作與該組件的計數一樣瑣碎和短暫的操作並沒有真正的負面影響，但是在具有更大風險的組件中，例如帶有刪除按鈕的“編輯文章”組件，就需要採取安全措施

The Checksum
The fundamental security underpinning Livewire is a "checksum" that travels along with request/responses and is used to validate that the state from the server hasn't been tampered with in the browser.


### 校驗

Livewire 用以確保安全的基礎機制為 "checksum"，會伴隨所有的請求/回應來使用。目的是驗證瀏覽器中伺服器的狀態是否未被篡改

這樣說比較好理解，比如剛才所說過的計數器組件。 Livewire 不會簡單地將 {count：1} 傳遞給瀏覽器，而是會使用安全密鑰生成 Hash 碼用於安全驗證並將其與狀態一起傳遞

計數器 的Livewire 組件，其狀態真實內容如下所示：

```
{
    state: { count: 1 },
    checksum: "A6jHn359Ku3lFc82arW8",
}
```

現在，如果歹徒在兩次請求之間篡改了瀏覽器中的狀態，則在 Livewire 處理組件更新之前，它將發現安全驗證的 Hash 碼不正確因而引發錯誤

### 持久中介層

Livewire採取的第二項安全措施是“持久中介層”，這意味著 Livewire 將捕獲在“初始請求”期間使用的任何身份驗證/授權中介層，並將其重新應用於後續請求

如果沒有此措施，則在使用者從應用登出後， Livewire 後續請求可能會被捕獲並重播，但不再有權訪問這些程式碼路徑

預設情況下，Livewire 重新應用每個 Laravel 應用附帶的現成的身份驗證和授權中介層。這是幾個預設值：

```
[
    ...
    \Illuminate\Auth\Middleware\Authenticate::class,
    \Illuminate\Auth\Middleware\Authorize::class,
]
```

如果你希望添加自己的中介層以進行捕獲並重新應用（如果存在），則可以在應用的服務中添加以下API：

```
Livewire::addPersistentMiddleware([
    YourOwnMiddleware::class,
]);
```

現在，如果將中介層分配給加載組件的原始路由，則你添加的所有中介層都將重新應用於後續的 Livewire 請求

## 套件開發

### 註冊自定義組件

你可以使用  Livewire::component() 手動註冊組件。如果要從 Composer 套件包中提供 Livewire 組件，這將很有用。通常這應該在服務供應器的 boot() 中完成

```
class YourPackageServiceProvider extends ServiceProvider {
    public function boot() {
        Livewire::component('some-component', SomeComponent::class);
    }
}
```

現在安裝了套件包的應用可以在其視圖中使用組件，如下所示：

```
<div>
    @livewire('some-component')
</div>
```


## Artisan 命令

### make 命令

建立 Foo.php 和 foo.blade.php
php artisan make:livewire foo

建立 FooBar.php 和 foo-bar.blade.php
php artisan make:livewire foo-bar

建立 Foo/Bar.php 和 foo/bar.blade.php
php artisan make:livewire foo.bar

只建立 Foo.php
php artisan make:livewire foo --inline

創建完成後，你可以使用 @livewire（'component-name'）blade 指令在 Blade 文件中呈現組件

不妨將 Livewire 組件當成載入(includes) Blade 視圖。你可以在 Blade 視圖中的任意位置插入 @livewire ，它將在該處渲染

```
@livewire('foo')
@livewire('foo-bar')
@livewire('foo.bar')
@livewire(Package\Livewire\Foo::class)
```

假如你是使用 Laravel 7 或更高的版本，你還可以使用標籤語法 

`<livewire:foo />`

### 修改 Stubs

您可以使用 livewire：stubs 命令來自定義 Livewire 用來創建新組件類別和視圖的 Stubs（模板）。

`php artisan livewire：stubs`

上面的命令將創建三個檔案：

* stubs/livewire.stub
* stubs/livewire.view.stub
* stubs/livewire.inline.stub

現在當你運行 make：livewire 命令時， Livewire 將改為使用上面的 Stub 檔案作為模板，你可以根據需要去修改這些檔案

### move 命令

php artisan livewire：move 命令將 移動/重新命名 組件類別和 Blade 視圖，並處理其命名空間和路徑

這是用法範例：

將 Foo.php|foo.blade.php 改成 Bar/Baz.php|bar/baz.blade.php

為了簡便，livewire:move 可改成 livewire:mv

### copy 命令

php artisan livewire：copy 命令將創建組件類別和 Blade 視圖的副本，並處理命名空間和路徑

以下是一些用法範例：

複製 Foo.php & foo.blade.php 成 Bar.php 和 bar.blade.php
php artisan livewire:copy foo bar


複製 Foo.php & foo.blade.php 成 Bar.php 和 bar.blade.php，如存在則強行覆蓋
php artisan livewire:copy foo bar --force

為了簡便，livewire:copy 可改成 livewire:cp

### delete 指令

The php artisan livewire:delete command 將移除組件類別和組件視圖

以下是一些例子:

移除 Foo.php & foo.blade.php
php artisan livewire:delete foo

強行移除 Foo.php & foo.blade.php，不需要再確認
php artisan livewire:delete foo --force

為了簡便，livewire:delete 可改成 livewire:rm

## 參考資料

[示範影片](https://laravel-livewire.com/screencasts)