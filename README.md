# livewire 學習手冊

![](https://i.imgur.com/HUS2orz.jpg)

## 快速開始

### 安裝 Livewire

Step 1.下載套件

`composer require livewire/livewire`

Step 2.在會用到Livewire的頁面上去載入JS和CSS檔案

```
...
    @livewireStyles
</head>
<body>
    ...

    @livewireScripts
</body>
</html>
```

Step 3.建立組件

執行以下指令來生成一個名為 counter 的 Livewire 組件

`php artisan make:livewire counter`

將會生成出以下兩點檔案

```
//app\Http\Livewire\Counter.php

namespace App\Http\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public function render()
    {
        return view('livewire.counter');
    }
}
```

```
//resources/views/.livewire/counter.blade.php

<div>
    ...
</div>
```

Step 4.編輯組件畫面內容

修改counter.blade.php來加入一些文字

```
//resources/views/.livewire/counter.blade.php

<div>
    <h1>Hello World!</h1>
</div>
```

> 注意
> 
> Livewire組件必須要有單一的根元素

Step 5.在視圖中加入組件

你可以把Livewire組件當作是用來被include的Blade檔案，你能夠使用 <livewire:組件名 />標籤來放入Livewire組件，它將會自動渲染

```
<head>
    ...
    @livewireStyles
</head>
<body>
    <livewire:counter />

    ...

    @livewireScripts
</body>
</html>
```

Step 6.確認視圖

開啟瀏覽器打開該視圖連結，看看組件的內容Hello World!是否有正常顯示

Step 7.為Livewire組件加入函式

將生成的兩個組件檔案改成內容如下:

```
//app\Http\Livewire\Counter.php

class Counter extends Component
{
    public $count = 0;

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
//resources\views\livewire\counter.blade.php

<div style="text-align: center">
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

Step 8.再次確認視圖

開啟瀏覽器打開該視圖連結並重載，看看組件的內容是否有重新渲染當你按下+按鈕時應該會看到數字自動更新而不需要每次都做頁面重載，就像是魔法依樣!

>總的來說，這個應用較為適合使用AlpineJS來搞定，但這是一個用來理解Livewire怎麼使用最簡單的一種實作範例

---
## 參考

施工中...