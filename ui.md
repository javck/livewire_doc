# UI介面

## 載入狀態

因為 Livewire 會在每次頁面觸發了一個行動時就會開始一段造訪伺服器的旅程，有時候我們的伺服器未必能夠及時的回應使用者的事件，像是點擊。這時候 Livewire 能協助你輕易地顯示載入狀態用以提示使用者，讓使用者有更好的互動體驗

## 載入狀態時開關元素(Toggling elements during "loading" states)

加了 wire:loading 語句的元素只有在當頁面處於等待行動(網路請求)完成的狀態下才會顯示

```
<div>
    <button wire:click="checkout">Checkout</button>

    <div wire:loading>
        Processing Payment...
    </div>
</div>
```

當 "Checkout" 按鈕被按下，一段 "付款進行中..."的訊息將會出現。當請求完成之後，這段訊息就會消失。假如你希望避免因為載入時間過短導致出現的訊息快閃的狀況，你能夠加入 .delay 修飾子。這樣的話只有在載入時間長於200微秒的狀況下才會顯示這段訊息

`<div wire:loading.delay>...</div>`

預設情況下， Livewire 會將載入提示元素的 "display" CSS 屬性設為 "inline-block"。假如你希望 Livewire 改成使用 "flex" 或 "grid" 的話，你能夠使用下面的修飾子

```
<div wire:loading.flex>...</div>
<div wire:loading.grid>...</div>
<div wire:loading.inline>...</div>
<div wire:loading.table>...</div>
```

你也能夠在載入狀態下隱藏該元素透過加入 .remove 修飾子

```
<div>
    <button wire:click="checkout">Checkout</button>

    <div wire:loading.remove>
        Hide Me While Loading...
    </div>
</div>
```

## 針對特定行動

剛才所提到的方法已經能夠應付一些簡單的組件，如果是更為複雜的組件，你可能會想要只有在特定的行動時才出現載入提示器

```
<div>
    <button wire:click="checkout">Checkout</button>
    <button wire:click="cancel">Cancel</button>

    <div wire:loading wire:target="checkout">
        Processing Payment...
    </div>
</div>
```

在上面的例子中，載入提示器將會在 "Checkout" 按鈕被點下時才會出現，按下 "Cancel" 按鈕時是不會出現的

wire:target 能夠透過逗號分隔的方式來傳入多個參數，像這樣 wire:target="foo, bar"

你也能夠指定帶特定參數的行動

```
<div>
    <button wire:click="update('bob')">Update</button>

    <div wire:loading wire:target="update('bob')">
        Updating Bob...
    </div>
</div>
```

## 針對模型 (Targeting models)

除了行動，你也能夠指定當一個 wire:model 被同步的狀況

```
<div>
    <input wire:model="quantity">

    <div wire:loading wire:target="quantity">
        Updating quantity...
    </div>
</div>
```

## 針對類別 (Toggling classes)

你也能夠在載入狀態時加入或移除元素的樣式類別，透過加入 .class 修飾子到 wire:loading 語法後面

```
<div>
    <button wire:click="checkout" wire:loading.class="bg-gray">
        Checkout
    </button>
</div>
```

現在，當 "Checkout" 按鈕被按下時，網路請求正在進行之時，背景將會轉為灰色

不只如此，你也能夠執行相反的操作，也就是移除樣式類別，做法就是加入 .remove 修飾子

```
<div>
    <button wire:click="checkout" wire:loading.class.remove="bg-blue" class="bg-blue">
        Checkout
    </button>
</div>
```

現在 bg-blue 樣式類別將會在按下按鈕進行載入之時被移除

## 開啟或關閉屬性 (Toggling attributes)

與樣式類別類似， 元素的 HTML 屬性也能夠在載入狀態時開啟或關閉

```
<div>
    <button wire:click="checkout" wire:loading.attr="disabled">
        Checkout
    </button>
</div>
```

現在，當 "Checkout" 按鈕被按下， disabled="true" 的這個屬性將會在載入狀態時被加到元素上

## Polling

Livewire 提供了一個語句叫做 wire:poll ，當你把他加入某個元素，它將會每2秒重新渲染組件，透過 Polling 來觸發 Ajax 改動是一個輕量級，相對於其他的解決方案像是 Laravel Echo . Pusher 或任何一個 WebSocket 技術來說

```
<div wire:poll>
    當前時間: {{ now() }}
</div>
```

你能夠加入修飾子來修改更新頻率，比如 750 微秒，請看下面的例子:

```
<div wire:poll.750ms>
    當前時間: {{ now() }}
</div>
```

如果你希望的是每隔一段時間呼叫某個行動而不是更新組件的話，你可以透過傳方法名稱給 wire:poll 來達到

```
<div wire:poll="foo">
    當前時間: {{ now() }}
</div>
```

現在，組件內的 foo() 將會在每2秒鐘被呼叫一次

### 在背景進行 Polling (Polling in the background)

當應用所在的瀏覽器分頁位於背景時， Livewire 將會減少 polling ，目的是減少對伺服器所進行的不必要 AJAX 請求。只有原先5%的 polling 請求會被保留

但假如你希望能夠保有相同的 polling 頻率即便是在背景的狀況下，你能夠使用 keep-alive 修飾子

```
<div wire:poll.keep-alive>
    Current time: {{ now() }}
</div>
```

## Prefetching

Livewire offers the ability to "prefetch" the result of an action on mouseover. Toggling display content is a common use case.

Livewire 提供一種能力讓你提前取得 mouseover 行動的結果，以 Toggling 的方式來顯示內容(滑鼠指到某個關鍵字時跳出相關內容)就是一種常見的應用


當某個行動"不會"造成副作用，像是寫東西到 Session 或資料庫，就可以使用這個能力。假如你 prefetch 的這個行動具有副作用的話，這些副作用將無法預期何時會發生，要特別注意

如要使用這個能力，請加入 prefetch 修飾子到指定的行動

```
<button wire:click.prefetch="toggleContent">Show Content</button>

@if ($contentIsVisible)
    <span>Some Content...</span>
@endif
```

現在，當滑鼠指標碰到 "Show Content" 按鈕， Livewire 將會提取 "toggleContent" 行動的結果於背景。一旦該按鈕真的被按下，他將會在頁面上顯示內容而無需發送額外的網路請求。假如該按鈕並沒被按下，該提取回應將會丟掉

## 離線狀態

有時候在使用者失去網路連線時提示他們是很重要的， Livewire 提供很有用的工具以便於離線狀態時進行某些行動

### 開啟或關閉元素 (Toggling elements)

你能夠在使用者處於離線狀態時顯示某個元素，透過加入  wire:offline 語句

```
<div wire:offline>
    You are now offline.
</div>
```

這個 `<div>` 預設將會自動被隱藏，只有在瀏覽器處於離線狀態時才會顯示

### 開啟或關閉樣式類別 (Toggling classes)

加入 class 修飾子能讓你在離線狀態時加入樣式類別到一個元素內

`<div wire:offline.class="bg-red-300"></div>`

現在，當瀏覽器處於離線狀態時，該元素將會收到 bg-redd-300 這個樣式類別，一旦恢復連線時該樣式類別就會被移除。如果想要做相反的操作，也就是移除樣式類別的話可以加入 .remove 這個修飾子，就跟 wire:loading 是相同的概念

`<div wire:offline.class.remove="bg-green-300" class="bg-green-300"></div>`

一但離線時，bg-green-300 樣式類別將會被從 `<div>` 給移除

### 開啟或關閉屬性 (Toggling attributes)

加入 attr 修飾子能讓你在離線時加入一個屬性到元素內

`<button wire:offline.attr="disabled">Submit</button>`

現在，當瀏覽器離線時按鈕將會無效。你也可以進行相反的操作，也就是移除屬性，透過加入 .remove 修飾子

## Dirty States

有些時候你想要提示使用者，當內容已經修改但卻還沒同步到後端的 Livewire 組件這樣的狀況，稱之為髒狀態。就可以用到這個技巧

當在輸入項使用 wire:model 或 wire:model.lazy，你可能會想要讓使用者知道該欄位處於髒狀態，直到 Livewire 完成回應

### 髒狀態時開啟或關閉樣式類別 (Toggling classes on "dirty" elements)

帶有 wire:dirty 語句的元素將會檢查前台與後台值的差異，以及最終返回的 Livewire 資料

加入 class 修飾子讓你能夠在元素處於髒狀態時加入樣式類別

```
<div>
    <input wire:dirty.class="border-red-500" wire:model.lazy="foo">
</div>
```

現在當使用者修改輸入項的值，該元素將會得到 border-red-500 樣式，該樣式會在該輸入項結束髒狀態時被移除，也就是 Livewire 組件更新完成之後

同樣的，你也能夠進行相反的操作，也就是移除類別，透過加入 .remove 修飾子，就像是在 wire:loading 所做的


```
<div>
    <input wire:dirty.class.remove="bg-green-200" class="bg-green-200" wire:model.lazy="foo">
</div>
```

bg-green-200 樣式類別將會在輸入項處於髒狀態時被移除


### 開關其他元素 (Toggling elements)

wire:dirty 語句在不使用修飾子的狀態下是會隱藏該元素直到觸發髒狀態，這可用於避免處於髒狀態時被使用者異動。但就如同載入狀態， dirty 語句同樣能用於開啟或關閉其他元素的樣貌，透過使用 wire:target

```
<div>
    <span wire:dirty wire:target="foo">Updating...</span>
    <input wire:model.lazy="foo">
</div>
```

在這個例子裡頭， span 預設會被隱藏，只有在 input 元素處於髒狀態時才會顯示出來


### 開關其他元素的樣式類別 (Toggling classes on other elements)

class和 attribute 修飾子能夠用於以相同的方式來參考元素

<div>
    <label wire:dirty.class="text-red-500" wire:target="foo">Full Name</label>
    <input wire:model.lazy="foo">
</div>

現在，當輸入像處於髒狀態，label 文字將會收到 text-red-500 狀態

## Defer Loading

Livewire 提供你 wire:init 語句讓你能在組件渲染完畢後立即執行行動。這在於你不想要載入整個頁面，而只想在頁面載入後載入一些資料時非常有用

```
class ShowPost extends Component
{
    public $readyToLoad = false;

    public function loadPosts()
    {
        $this->readyToLoad = true;
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => $this->readyToLoad
                ? Post::all()
                : [],
        ]);
    }
}
```
```
<div wire:init="loadPosts">
    <ul>
        @foreach ($posts as $post)
            <li>{{ $post->title }}</li>
        @endforeach
    </ul>
</div>
```

loadPosts 行動 將會在 Livewire 組件被渲染在頁面上時立即被執行