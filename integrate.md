# JS整合

## AlpineJS

在許多情況下，頁面交互並不保證能對伺服器進行完整的請求流程，比如開啟或關閉一個 Modal 視圖

在這種情況下， AlpineJS 是 Livewire 最完美的夥伴

它使您可以以聲明式/反應式的方式將JavaScript直接添加到你的網頁標記中，就如同Vue.js那樣。(看起來Livewire 真的很想讓自己變成PHP版本的Vue.js)

### 安裝

你如果想要在 Livewire 裡頭使用 Alpine 就必須安裝它

要安裝 Alpine，請加入以下 script 標籤到視圖檔的 <head> 區塊

```
<head>
    ...
    <script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.8.0/dist/alpine.min.js" defer></script>
    <!-- The "defer" attribute is important to make sure Alpine waits for Livewire to load first. -->
</head>
```

如需了解更多的安裝資訊，請參考 Alpine 的文件

### 在Livewire 裡頭使用 Alpine

這是一個在 Livewire 組件視圖檔案使用 AlpineJS 做出下拉選單功能的例子

```
<div>
    ...

    <div x-data="{ open: false }">
        <button @click="open = true">Show More...</button>

        <ul x-show="open" @click.away="open = false">
            <li><button wire:click="archive">Archive</button></li>
            <li><button wire:click="delete">Delete</button></li>
        </ul>
    </div>
</div>
```

### 萃取出可重複使用的 Blade 組件

假如你還不熟悉 Livewire 和 AlpineJS，那麼在程式碼中混合這兩者的語法可能會造成你混淆

因此有一個策略可以使用的是，將 Alpine 語法的部分包成可重複使用的 Blade 組件，然後將它們用在 Livewire 或者是應用當中

以下是一個例子，用的是 Laravel 7 Blade 組件標籤指令

Livewire 視圖:

```
<div>
    ...

    <x-dropdown>
        <x-slot name="trigger">
            <button>Show More...</button>
        </x-slot>

        <ul>
            <li><button wire:click="archive">Archive</button></li>
            <li><button wire:click="delete">Delete</button></li>
        </ul>
    </x-dropdown>
</div>
``` 
可重複使用的 Blade "dropdown" 組件:

```
<div x-data="{ open: false }">
    <span @click="open = true">{{ $trigger }}</span>

    <div x-show="open" @click.away="open = false">
        {{ $slot }}
    </div>
</div>
```

現在，Livewire 和 Alpine 的語法已經完成分離了，而且你已經有了一個可重複使用的 Blade 組件來用在其他 Livewire 組件

### 從 Alpine 來與 Livewire 進行互動: $wire

從任何 Livewire 組件裡頭的 Alpine 組件，你能夠取用魔法 $wire 物件來取用甚至是控制 Livewire 組件

為了示範該如何使用，我們將在 Alpine 創造一個 "counter" 組件，並用它來透過 hood 來控制 Livewire

```
class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
}
```
```
<div>
    <!-- Alpine Counter Component -->
    <div x-data>
        <h1 x-text="$wire.count"></h1>

        <button x-on:click="$wire.increment()">Increment</button>
    </div>
</div>
```

現在當使用者按下 "Increment" 按鈕，一個標準的 Livewire 流程將會觸發，而且 Alpine 將會呈現 Livewire 的新 $count 值

因為 $wire 在 hood 裡頭使用了 JavaScript 代理，因此你能夠取用 Livewire 的屬性以及方法，而且這些操作都將傳給 Livewire。除了這些功能之外，$wire 也提供你一些內建方法讓你使用

以下是 $wire 完整的 API

// 取得 Livewire 的屬性
$wire.foo

// 呼叫 Livewire 的方法
$wire.someMethod(someParam)

// 呼叫 Livewire 的方法，並用其回傳值來做事情
$wire.someMethod(someParam)
    .then(result => { ... })

// 呼叫 Livewire 的方法，並用 async/await(異步的方式) 來儲存其回應
let foo = await $wire.getFoo()

// 發出一個名為 "some-event" 的 Livewire 事件並傳入兩個參數
$wire.emit('some-event', 'foo', 'bar')

// 偵聽一個名為 "some-event" 的 Livewire 事件
$wire.on('some-event', (foo, bar) => {})

// 取得 Livewire 屬性
$wire.get('property')

// 設定 Livewire 屬性為某個指定值
$wire.set('property', value)

// 呼叫 Livewire 的行動(方法)
$wire.call('someMethod', param)

// 取得 Livewire 組件底層的 JavaScript 實例
$wire.__instance

### 在 Livewire 和 Alpine 之間分享狀態 :@entangle

Livewire 有一個極為強大的功能稱為 "entangle" 允許你把 Livewire 和 Alpine 屬性綁定在一起。透過綁定，當一個值改變，被綁定的另一個值也跟著改變

為了示範，同樣使用之前的 dropdown 範例，但這次 show 屬性將在 livewire 和 Alpine 之間綁定在一起，我們現在可以在兩者之間控制 dropdown 的狀態

```
class Dropdown extends Component
{
    public $showDropdown = false;

    public function archive()
    {
        ...
        $this->showDropdown = false;
    }

    public function delete()
    {
        ...
        $this->showDropdown = false;
    }
}
```
```
<div x-data="{ open: @entangle('showDropdown') }">
    <button @click="open = true">Show More...</button>

    <ul x-show="open" @click.away="open = false">
        <li><button wire:click="archive">Archive</button></li>
        <li><button wire:click="delete">Delete</button></li>
    </ul>
</div>
```

現在使用者可透過 Alpine 開啟 dropdown，但當他按下一個 Livewire 行動，比如 "Archive" 將會告知 Livewire 去關閉 dropdown。不管是 Alpine 又或者是 Livewire 都能夠控制其對應的屬性，那與之對應的屬性也會跟著變更

有時，不必在每次 Alpine 更改時都更新Livewire，而你希望將更改與下一個發出的 Livewire 請求捆綁在一起。在這些情況下，你可以像這樣鏈接 .defer 屬性

```
<div x-data="{ open: @entangle('showDropdown').defer }">
    ...
```
現在，當使用者切換下拉菜單的打開和關閉狀態時，將不會對 Livewire 發送 AJAX 請求，但是當通過 “archive” 或 “delete” 之類的按鈕觸發 Livewire 操作時，“showDropdown” 的新狀態將變為與請求捆綁在一起

假如你分不清兩者的差異，開啟瀏覽器的開發者工具，從 XHR 請求來觀察 .defer 有沒有加的差異

### 從 Blade 組件取用 Livewire 語句

在 Livewire 應用中提取可重複使用的 Blade 組件是一種基本模式

在 Livewire 上下文中實現 Blade 組件時，你可能會遇到的一個困難是從組件內部訪問屬性值，例如 wire：model

例如，你可能創造了一個文字輸入項 Blade 組件，像這樣:

```
使用
<x-inputs.text wire:model="foo"/>

定義
<div>
    <input type="text" {{ $attributes }}>
</div>
```

像這樣的簡單 Blade 組件可以運作良好， Laravel 和 Blade 將自動轉發添加到組件的任何其他屬性（在這種情況下，如wire：model），並將它們放置在<input> 標籤上，因為我們回應了屬性包（$ attributes）

但是，有時你可能需要提取有關傳遞給組件的 Livewire 屬性之更多詳細資料

針對這種情況， Livewire 提供了一個 $attributes->wire() 來幫助你搞定這些工作

比如下面的例子:

`<x-inputs.text wire:model.defer="foo" wire:loading.class="opacity-25"/>`

你能夠像這樣從 Blade 的 $attribute 屬性包取得 Livewire 語句訊息

```
$attributes->wire('model')->value(); // "foo"
$attributes->wire('model')->modifiers(); // ["defer"]
$attributes->wire('model')->hasModifier('defer'); // true


$attributes->wire('loading')->hasModifier('class'); // true
$attributes->wire('loading')->value(); // "opacity-25"
```

你也能夠個別的轉發這些 Livewire 語句，例如:


```
<x-inputs.text wire:model.defer="foo" wire:loading.class="opacity-25"/>

你能夠像這樣去轉發 "wire:model.defer="foo" 語句
<input type="text" {{ $attributes->wire('model') }}>

輸出
<input type="text" wire:model.defer="foo">
```

使用此工具的方式有很多，但是一種常見的例子是將其與上述的 @entangle 指令結合在一起使用

```
<x-dropdown wire:model="show">
    <x-slot name="trigger">
        <button>Show</button>
    </x-slot>

    Dropdown Contents
</x-dropdown>
```

```
定義
<div x-data="{ open: @entangle($attributes->wire('model')) }">
    <span @click="open = true">{{ $trigger }}</span>

    <div x-show="open" @click.away="open = false">
        {{ $slot }}
    </div>
</div>
```

> 注意
> 
> 假如 .defer 修飾子是透過 wire:model.defer 來傳入， @entangle 語句將自動進行分析並在 hood 時加入 @entangle('...').defer 修飾子

### 建立一個 Datepicker 組件

Livewire 裡頭的 JavaScript 的常見應用是自定義表單輸入，比如日期選擇器，顏色選擇器等之類的組件對於你的應用通常是必不可少的

通過使用與上面相同的模式（並添加一些額外的小變化），我們可以利用 Alpine 輕鬆地與這些類型的 JavaScript 組件進行交互


讓我們創建一個稱為 date-picker 的可重複使用的 Blade 組件，我們可以透過它使用 wire：model 將某些數據綁定到 Livewire 中

示範你可以如何使用它:

```
<form wire:submit.prevent="schedule">
    <label for="title">Event Title</label>
    <input wire:model="title" id="title" type="text">

    <label for="date">Event Date</label>
    <x-date-picker wire:model="date" id="date"/>

    <button>Schedule Event</button>
</form>
```

對於此組件，我們將使用 Pikaday 函式庫

根據文件，該套件包的最基本用法如下所示範：

```
<input type="text" id="datepicker">

<script>
    new Pikaday({ field: document.getElementById('datepicker') })
</script>
```

你只需要加入一個<input>元素， Pikaday 將為你添加所有額外的日期選擇器行為

現在，讓我們看看如何利用這個函式庫來編寫可重複使用的 Blade 組件

可重複使用的日期選擇器 Blade 組件：

```
<input
    x-data
    x-ref="input"
    x-init="new Pikaday({ field: $refs.input })"
    type="text"
    {{ $attributes }}
>
```

> 注意：
>
> {{ $attributes }}表達式是 Laravel 7 及更高版本中的一種機制，用於轉發在組件標籤上聲明的額外HTML屬性

### 轉發 wire:model 輸入事件

Let's create a contrived example where when a user clicks the first button a property called $foo is set to bar, and when a user clicks the second button, $foo is set to baz.

在 hood 裡頭， wire：model 每次派發輸入事件在元素上或元素下時，都會添加一個事件偵聽器以更新屬性。在 Livewire 和 Alpine 之間進行通信的另一種方法是使用 Alpine 派發一個輸入事件，該事件具有在其上具有 wire：model 的元素內或元素上的一些數據

請看這個例子，當使用者按下第一個按鈕時，名為 $foo 的屬性設置為bar，而當使用者按下第二個按鈕時，$foo 設置為baz。

Livewire 組件視圖:

```
<div>
    <div wire:model="foo">
        <button x-data @click="$dispatch('input', 'bar')">Set to "bar"</button>
        <button x-data @click="$dispatch('input', 'baz')">Set to "baz"</button>
    </div>
</div>
```

一個更常見的例子是創建一個"顏色選擇器" Blade 組件，該組件可能會在 Livewire 組件中使用

選色器組件用法：

```
<div>
    <x-color-picker wire:model="color"/>
</div>
```

為了定義組件，我們將使用名為 Vanilla Picker 的第三方顏色選擇器函式庫

本範例假定你已將該函式庫加載到頁面上

選色器 Blade組件定義：

```
<div
    x-data="{ color: '#ffffff' }"
    x-init="
        picker = new Picker($refs.button);
        picker.onDone = rawColor => {
            color = rawColor.hex;
            $dispatch('input', color)
        }
    "
    wire:ignore
    {{ $attributes }}
>
    <span x-text="color" :style="`background: ${color}`"></span>
    <button x-ref="button">Change</button>
</div>
Color-picker Blade Component Definition (Commented):

<div
    x-data="{ color: '#ffffff' }"
    x-init="
        // Wire up to show the picker when clicking the 'Change' button.
        picker = new Picker($refs.button);
        // Run this callback every time a new color is picked.
        picker.onDone = rawColor => {
            // Set the Alpine 'color' property.
            color = rawColor.hex;
            // Dispatch the color property for 'wire:model' to pick up.
            $dispatch('input', color)
        }
    "
    // Vanilla Picker will attach its own DOM inside this element, so we need to
    // add `wire:ignore` to tell Livewire to skip DOM-diffing for it.
    wire:ignore
    // Forward the any attributes added to the component tag like `wire:model=color`
    {{ $attributes }}
>
    <!-- Show the current color value with the backgound color set to the chosen color. -->
    <span x-text="color" :style="`background: ${color}`"></span>
    <!-- When this button is clicked, the color-picker dialogue is shown. -->
    <button x-ref="button">Change</button>
</div>
```

### 忽略 DOM-改動(使用 wire:ignore)

幸運的是，像 Pikaday 這樣的函式庫在頁面末尾添加了其額外的DOM。許多其他函式庫在初始化DOM後就立即對其進行操作，並在與它們交互時繼續使DOM發生變化

發生這種情況時， Livewire 很難跟踪要在組件更新中保留哪些DOM操作以及要丟棄哪些DOM操作

要告訴 Livewire 忽略組件中 HTML 子集的更改，可以添加 wire：ignore 指令

Select2 是接管一部分DOM的函式庫之一（它將<select>標記替換為許多自定義標籤）

這是一個在 Livewire 組件中使用 Select2 函式庫的範例，以說明 wire：ignore 的用法

```
<div>
    <div wire:ignore>
        <select class="select2" name="state">
            <option value="AL">Alabama</option>
            <option value="WY">Wyoming</option>
        </select>

        <!-- Select2 will insert its DOM here. -->
    </div>
</div>

@push('scripts')
<script>
    $(document).ready(function() {
        $('.select2').select2();
    });
</script>
@endpush
```

> 注意:
>
>有時忽略元素本身的更改（而不是其子元素）會很有用。在這種情況下，你可以將 self 修飾子添加到 wire：ignore 指令，如下所示： wire：ignore.self
 

## Laravel Echo

Livewire 與 Laravel Echo 的完美搭配，可使用 WebSocket 在你的網頁上提供實時功能

此功能假定你已經安裝了 Laravel Echo ，並且 `window.Echo` 物件為全域。有關更多資訊請查看文檔

考慮以下Laravel事件：

```
class OrderShipped implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastOn()
    {
        return new Channel('orders');
    }
}
```

比如你觸發 Laravel 廣播系統的事件:

`event(new OrderShipped);`

一般來說，你會像這樣來偵聽 Laravel Echo 的事件:

```
Echo.channel('orders')
        .listen('OrderShipped', (e) => {
            console.log(e.order.name);
        });
```

但是使用 Livewire ，你要做的就只是在 $listeners 屬性中註冊它，並使用一些特殊的語法來指定它源自於Echo

```
class OrderTracker extends Component
{
    public $showNewOrderNotification = false;

    // Special Syntax: ['echo:{channel},{event}' => '{method}']
    protected $listeners = ['echo:orders,OrderShipped' => 'notifyNewOrder'];

    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }
}
```

現在 Livewire 將攔截從 Pusher 收到的事件，並採取相應的措施。以類似的方式，你還可以收聽廣播到私人/狀態頻道的事件

請確保正確定義了身份驗證的回呼

```
class OrderTracker extends Component
{
    public $showNewOrderNotification = false;
    public $orderId;

    public function mount($orderId)
    {
        $this->orderId = $orderId;
    }

    public function getListeners()
    {
        return [
            "echo-private:orders.{$this->orderId},OrderShipped" => 'notifyNewOrder',
            // Or:
            "echo-presence:orders.{$this->orderId},OrderShipped" => 'notifyNewOrder',
        ];
    }

    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }
}
```

## Inline Scripts


Livewire 建議你將 AlpineJS 用於大多數 JavaScript 需求，但它確實支持直接在你的組件視圖裡頭使用 <script> 標籤

```
<div>
    <!-- Your components HTML -->

    <script>
        document.addEventListener('livewire:load', function () {
            // Your JS here.
        })
    </script>
</div>
```

請注意，您的腳本僅在首次渲染組件時運行一次。如果你以後需要運行 JavaScript 函數，請從該組件發出事件，然後按如下所述在 JavaScript 中偵聽該事件

你還可以從 Livewire 組件將腳本直接推送到 Blade 堆疊上：

```
@push('scripts')
<script>
    // Your JS here.
</script>
@endpush
```

### 訪問 JavaScript 組件實例

由於 Livewire 同時具有 PHP 和 JavaScript 區塊，因此每個組件也都有一個 JavaScript 物件。你可以在組件視圖中使用特殊的 @this Blade 指令訪問此對象

這是一個例子：

```
<script>
    document.addEventListener('livewire:load', function () {
        // Get the value of the "count" property
        var someValue = @this.count

        // Set the value of the "count" property
        @this.count = 5

        // Call the increment component action
        @this.increment()

        // Run a callback when an event ("foo") is emitted from this component
        @this.on('foo', () => {})
    })
</script>
```

> 注意
>
> @this 指令將編譯為以下字串以供 JavaScript 解析："Livewire.find（[component-id]）""
