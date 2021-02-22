# 組件功能

## 驗證

在Livewire進行驗證非常類似於Laravel的標準表單驗證。簡單來說，Livewire 提供了 $rules 屬性用來設定每個組件的驗證規則，接著就能使用 $this->validate() 來利用這些規則去驗證組件屬性

這是一個簡單的一個利用Livewire來進行表單驗證的例子

```
class ContactForm extends Component
{
    public $name;
    public $email;

    protected $rules = [
        'name' => 'required|min:6',
        'email' => 'required|email',
    ];

    public function submit()
    {
        $this->validate();

        // 以下如果驗證失敗的話就不會執行到

        Contact::create([
            'name' => $this->name,
            'email' => $this->email,
        ]);
    }
}
```
```
<form wire:submit.prevent="submit">
    <input type="text" wire:model="name">
    @error('name') <span class="error">{{ $message }}</span> @enderror

    <input type="text" wire:model="email">
    @error('email') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Contact</button>
</form>
```

假如驗證失敗的話，一個標準的 ValidationException 將會被丟出並被 Livewire抓到，而且一個標準的 $errors 物件能夠在組件的視圖內取得。因此任何你原先所寫過的Blade視圖檔案，用來處理驗證的部分都能直接拿來使用，不需大幅修改

你也能夠在錯誤包內加入自定義的 key/訊息 對

`$this->addError('key', 'message')`

假如你需要動態的去定義驗證規則，你能夠將組件的 $rules 屬性修改成 rules() ，像這樣:


```
class ContactForm extends Component
{
    public $name;
    public $email;

    protected function rules()
    {
        return [
            'name' => 'required|min:6',
            'email' => ['required', 'email', 'not_in:' . auth()->user()->email],
        ];
    }
}
```

### 即時驗證

有時候當使用者在邊輸入文字時一邊進行驗證是很有用的。Livewire讓即時驗證功能變得很簡單，透過 $this->validateOnly()

為了在每一個更新時去驗證一個輸入項，我們可以使用 Livewire 的 updated hook:

```
class ContactForm extends Component
{
    public $name;
    public $email;

    protected $rules = [
        'name' => 'required|min:6',
        'email' => 'required|email',
    ];

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function saveContact()
    {
        $validatedData = $this->validate();

        Contact::create($validatedData);
    }
}
```
```
<form wire:submit.prevent="saveContact">
    <input type="text" wire:model="name">
    @error('name') <span class="error">{{ $message }}</span> @enderror

    <input type="text" wire:model="email">
    @error('email') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Contact</button>
</form>
```
讓我們來分解一下究竟這個例子裡頭有哪些重點:

### 使用者輸入文字到 "name" 輸入項

當使用者輸入他們的名字，一個驗證錯誤訊息將會出現，告知他們名字短於6個字元以提醒其補完。假如使用者未改正就切換到輸入email，如果名字有錯誤的話仍然會出現提示名字錯誤的訊息

當使用者提交表單後，還會有一個最終的驗證確認，沒有問題的話才會存入資料庫

你可以會感到困惑，為什麼我會需要 validateOnly?難道我不能使用 validate 就好嗎? 原因在於當單一的修改就要去驗證所有的欄位，這將會是惱人的用戶體驗。想像一下你才剛開始填入第一個欄位，結果突然間每個輸入項都跑出錯誤訊息，這是不是很困擾?

所以使用 validateOnly 就能避免這個問題，它只會驗證當前更新的輸入項

Validating with rules outside of the $rules property

### 不透過 $rules 屬性來定義驗證規則

假如你因為某種原因不想要把驗證規則定義在 $rules 屬性中，你永遠可以直接把驗證規則直接傳入 validate() 以及 validateOnly()

```
class ContactForm extends Component
{
    public $name;
    public $email;

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName, [
            'name' => 'min:6',
            'email' => 'email',
        ]);
    }

    public function saveContact()
    {
        $validatedData = $this->validate([
            'name' => 'required|min:6',
            'email' => 'required|email',
        ]);

        Contact::create($validatedData);
    }
}
```

### 自定義錯誤訊息 & 屬性

假如你想要自定義用於 Livewire組件的驗證訊息，你能夠透過 $messages 屬性

假如你想要沿用 Laravel預設的驗證訊息，但只自定義訊息的 :attribute 部分，你能夠使用 $validationAttributes 屬性來定義屬性名稱

```
class ContactForm extends Component
{
    public $email;

    protected $rules = [
        'email' => 'required|email',
    ];

    protected $messages = [
        'email.required' => 'The Email Address cannot be empty.',
        'email.email' => 'The Email Address format is not valid.',
    ];

    protected $validationAttributes = [
        'email' => 'email address'
    ];

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function saveContact()
    {
        $validatedData = $this->validate();

        Contact::create($validatedData);
    }
}
```

假如你沒有使用全域的驗證屬性 $rules ，那你可以直接將自定義訊息與屬性直接傳入 validate()

```
class ContactForm extends Component
{
    public $email;

    public function saveContact()
    {
        $validatedData = $this->validate(
            ['email' => 'required|email'],
            [
                'email.required' => 'The :attribute cannot be empty.',
                'email.email' => 'The :attribute format is not valid.',
            ],
            ['email' => 'Email Address']
        );

        Contact::create($validatedData);
    }
}
```

### 直接改動錯誤訊息包

validate() 和 validateOnly() 應該能夠處理大部分工作，但有時候你可能會閒的發慌想要自己去接手 Livewire 的內部錯誤包

Livewire 提供了一個有力的方法給你直接管理錯誤包，在每一個 Livewire 的組件類別內，你能夠呼叫以下方法

```
// 快速加入一個錯誤訊息到錯誤包內
$this->addError('email', 'The email field is invalid.');
```

```
//這裏個方法做相同的事情，也就是清除錯誤包
$this->resetErrorBag();
$this->resetValidation();
```

```
//假如你只想要清除某個key的錯誤訊息，你能夠使用
$this->resetValidation('email');
$this->resetErrorBag('email');
```

```
//這將會給你完整的取用整個錯誤包
$errors = $this->getErrorBag();
//透過錯誤包實例，你能夠做像這樣的事情
$errors->add('some-key', 'Some message');
```

### 測試驗證

Livewire 提供了好用的驗證工具來幫助你測試驗證，就讓我們來寫一個聯絡單組件的簡單測試功能

```
/** @test  */
public function name_and_email_fields_are_required_for_saving_a_contact()
{
    Livewire::test('contact-form')
        ->set('name', '')
        ->set('email', '')
        ->assertHasErrors(['name', 'email']);
}
```

這看起來已經挺好用了，但我們還可以再更進一步來驗證某一個規則是否正常

```
/** @test  */
public function name_and_email_fields_are_required_for_saving_a_contact()
{
    Livewire::test('contact-form')
        ->set('name', '')
        ->set('email', '')
        ->assertHasErrors([
            'name' => 'required',
            'email' => 'required',
        ]);
}
```

Livewire也提供了相反的驗證方法，比如 assertHasErrors -> assertHasNoErrors():

```
/** @test  */
public function name_field_is_required_for_saving_a_contact()
{
    Livewire::test('contact-form')
        ->set('name', '')
        ->set('email', 'foo')
        ->assertHasErrors(['name' => 'required'])
        ->assertHasNoErrors(['email' => 'required']);
}
```

如果想要看關於這兩個方法的更多支援語法，請去參考 Testing 文件

### 自定義驗證器

假如你想要在Livewire內使用自定義的驗證系統，這絕對可行。 Livewire 將會抓取 ValidationException 並提供錯誤到視圖，就如同使用 $this->validate() 一般，請看這個例子

```
use Illuminate\Support\Facades\Validator;

class ContactForm extends Component
{
    public $email;

    public function saveContact()
    {
        $validatedData = Validator::make(
            ['email' => $this->email],
            ['email' => 'required|email'],
            ['required' => 'The :attribute field is required'],
        )->validate();

        Contact::create($validatedData);
    }
}
```
```
<div>
    Email: <input wire:model.lazy="email">

    @if($errors->has('email'))
        <span>{{ $errors->first('email') }}</span>
    @endif

    <button wire:click="saveContact">Save Contact</button>
</div>
```

你可能會想是否可以使用Laravel的 FormRequest，根據 Livewire 的原先目的，要綁定在 Http 請求才能使用是不現實的，因此這樣的做法並不建議也不可能

## 檔案上傳

> 注意
> 
> 你的 Livewire 版本須為 1.2.0 以上才能使用這個功能

Livewire 讓上傳與儲存檔案變得極為簡單，這個超讚，每次我教檔案處理就覺得很辛苦，必須推!

首先，加入 withFileUploads trait 到組件裏頭。你就可以使用 wire:model到檔案上傳輸入項，就如同其他輸入項一般。剩下的就交給Livewire幫你搞定吧!

這是一個處理上傳照片的簡單組件範例:

```
use Livewire\WithFileUploads;

class UploadPhoto extends Component
{
    use WithFileUploads;

    public $photo;

    public function save()
    {
        $this->validate([
            'photo' => 'image|max:1024', // 1MB Max
        ]);

        $this->photo->store('photos');
    }
}
```
```
<form wire:submit.prevent="save">
    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Photo</button>
</form>
```

就跟你想得差不多，處理檔案輸入項和其他輸入項沒有啥不同，就是加入 wire:model 到 input 標籤，其他的就交給 Livewire 幫你搞定即可

然而其實底層 Livewire 幫我們做了相較於其他輸入項更多的事情，我們來看看當使用者選擇一個檔案來上船的時候有甚麼小細節呢?

當一個新檔案被選取， Livewire 的 JS 讓對伺服器上的組件進行初步請求取得一個暫時的簽名上傳網址。一旦得到網址之後，JS就會對該網址進行真正的上傳，將上傳檔案存到由 Livewire 所指定的臨時資料夾，並返回該臨時檔案的唯一 hash ID 

現在我們的公開屬性($photo)被賦值先前的臨時上傳檔案，並準備接下來的儲存或驗證作業

### 儲存上傳檔案

之前的例子示範了基礎的儲存劇本:移動臨時上傳檔案到 photos 資料夾，該資料夾位於應用的預設檔案系統磁碟

然而，你可能想要自定義儲存檔案的名稱，甚至是指定別的儲存系統來儲存檔案，例如 S3 bucket

開心的是 Livewire 依循著 Laravel 用來儲存上傳檔案的 API，所以你可以直接參考 Laravel 的官方文件，不過這裡還是先提供一個較為常用的儲存劇本給你參考

// 儲存上傳檔案到預設檔案系統磁碟的 photos 資料夾
$this->photo->store('photos');

// 將檔案儲存到 S3 bucket 的 photos 資料夾
$this->photo->store('photos', 's3');

// 儲存上傳檔案到預設檔案系統磁碟的 photos 資料夾，並更名為 "avatar.png"
$this->photo->storeAs('photos', 'avatar');

// 將檔案儲存到 S3 bucket 的 photos 資料夾，並更名為 "avatar.png"
$this->photo->storeAs('photos', 'avatar', 's3');

// 將檔案儲存到 S3 bucket 的 photos 資料夾，並設為公開
$this->photo->storePublicly('photos', 's3');

// 將檔案儲存到 S3 bucket 的 photos 資料夾，設為公開，並更名為 "avatar.png"
$this->photo->storePubliclyAs('photos', 'avatar', 's3');

以上的這些方法應該可以提供你足夠的彈性來儲存上傳檔案，你可以根據自己的需求來選擇

### 處理多檔案

Livewire 會自動偵測 `<input>` 標籤的 multiple 屬性來自動啟動處理多檔案機制

這是一個處理多檔案上傳的例子

```
use Livewire\WithFileUploads;

class UploadPhotos extends Component
{
    use WithFileUploads;

    public $photos = [];

    public function save()
    {
        $this->validate([
            'photos.*' => 'image|max:1024', // 1MB Max
        ]);

        foreach ($this->photos as $photo) {
            $photo->store('photos');
        }
    }
}
```
```
<form wire:submit.prevent="save">
    <input type="file" wire:model="photos" multiple>

    @error('photos.*') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Photo</button>
</form>
```

### 檔案驗證

就如你之前例子所見，透過 Livewire 來驗證上傳檔案是非常接近先前 Laravel 控制器的標準做法

如果需要了解更多檔案驗證機制，請參考Laravel官方文件

### 即時驗證

即時驗證使用者所上傳的檔案是可能的，你能在使用者按下 "submit" 之前進行檔案驗證

老話一句，做法和在 Livewire 處理其他輸入項的即時驗證相同

```
use Livewire\WithFileUploads;

class UploadPhoto extends Component
{
    use WithFileUploads;

    public $photo;

    public function updatedPhoto()
    {
        $this->validate([
            'photo' => 'image|max:1024', // 1MB Max
        ]);
    }

    public function save()
    {
        // ...
    }
}
```
```
<form wire:submit.prevent="save">
    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Photo</button>
</form>
```

現在，當使用者選擇一個檔案時(時機點就在 Livewire 將上傳檔案放到臨時資料夾之後)，該檔案將會被進行驗證，該使用者將會在提交表單前收到驗證錯誤的訊息

### 臨時預覽網址

就在使用者選擇一個檔案後，你可能想要在提交表單並儲存檔案之前去預覽它

Livewire 加入了 temporaryUrl() 來滿足你的這個小小需求

> 注意
> 
> 考量到安全，臨時預覽網址功能只支持圖檔上傳

這是一個圖檔上傳的預覽範例:

```
use Livewire\WithFileUploads;

class UploadPhotoWithPreview extends Component
{
    use WithFileUploads;

    public $photo;

    public function updatedPhoto()
    {
        $this->validate([
            'photo' => 'image|max:1024',
        ]);
    }

    public function save()
    {
        // ...
    }
}
```
```
<form wire:submit.prevent="save">
    @if ($photo)
        Photo Preview:
        <img src="{{ $photo->temporaryUrl() }}">
    @endif

    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save Photo</button>
</form>
```

就如同先前所言， Livewire 將暫存檔案放在非公開的資料夾，因此，並沒有甚麼便利方法來讓你以公開網址來對外公開暫存資料夾。因此剛才的例子重點在於，Livewire 為你處理的所有複雜與困難的工作，透過提供一個臨時並有簽名(防止修改)的公開網址來讓你能夠在頁面上預覽使用者上傳的圖檔

這個網址在設計上是經過巧思的，使用者無法從網址看出你真實的檔案系統架構。因為有簽名的關係，使用者也無法隨意改動網址來試圖去預覽資料夾的其他檔案，簡言之，安全性不需要擔心

另外假如你有設定 Livewire 去使用 S3 來作為臨時檔案儲存系統，呼叫 temporaryUrl() 將會生成一個臨時的簽名網址指向到 S3 資料夾，因此這個預覽將不會關連到你的 Laravel 應用伺服器

### 測試檔案上傳

測試在 Livewire 進行檔案上傳非常簡單，透過 Laravel 的檔案上傳測試幫助函式

這是一個完整的範例，用來說明如何測試 Livewire 的上傳檔案組件

```
/** @test */
public function can_upload_photo()
{
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.png');

    Livewire::test(UploadPhoto::class)
        ->set('photo', $file)
        ->call('upload', 'uploaded-avatar.png');

    Storage::disk('avatars')->assertExists('uploaded-avatar.png');
}
```

這是 "UploadPhoto" 組件的部分程式片段，用以讓先前的測試能夠通過

```
class UploadPhoto extends Component
{
    use WithFileUploads;

    public $photo;

    // ...

    public function upload($name)
    {
        $this->photo->storeAs('/', $name, $disk = 'avatars');
    }
}
```

如想了解更多關於測試檔案上傳的細節，請參考 Laravel 的檔案上傳測試文件

### 直接上傳到 Amazon S3

如先前所言， Livewire 儲存所有上傳檔案到臨時資料夾，直到開發者決定要永久的儲存這些檔案

一般來說 Livewire 會使用預設的檔案系統資料夾(通常都是本地端)，並將這些檔案存在一個名為 "livewire-tmp" 的資料夾，這代表每當檔案上傳勢必會觸及到你的伺服器，就算最終這些檔案是要被存到 S3 bucket 也是一樣，難道沒辦法全交給 S3 bucket 處理嗎?

假如你想要直接把暫存資料夾移到 S3 bucket，沒有問題，你可以輕易地透過設定行為來達成:

在你的 config/livewire.php 檔案內，設定 livewire.temporary_file_upload.disk 為 S3 ，又或者是其他使用 S3 driver 的自定義磁碟

```
//config\livewire.php

return [
    ...
    'temporary_file_upload' => [
        'disk' => 's3',
        ...
    ],
];
```

現在每當使用者上傳一個檔案，這個檔案將永遠不會存在你的伺服器，它將直接被上傳到 S3 bucket，在一個名為 "livewire-tmp" 的子資料夾

### 設定檔案自動清除

這個暫存資料夾將會快速地被檔案所填滿，因此設定 S3 能夠清除超過24個小時的檔案是很重要的

為了設定這個行為，只要在有 S3 bucket 設定的環境執行以下的 artisan 命令

php artisan livewire:configure-s3-upload-cleanup

現在，任何在暫存資料夾內超過24小時的檔案將會自動地被 S3 清除

假如你不使用 S3， Livewire 將會自動地為你清除檔案，也就不需要執行這個命令

### 載入提示器

雖然 wire:model 用於檔案輸入項的底層實作與其他輸入項有所不同，用於載入顯示器的介面卻是相同的

你能夠透過這樣的方式來顯示載入提示器

```
<input type="file" wire:model="photo">

<div wire:loading wire:target="photo">上傳中...</div>
```

現在，當檔案在上傳檔案時會顯示"上傳中..."的訊息，而當上傳結束之後就會隱藏這個訊息

它將會與整個 Livwire 載入狀態 APIs 協同作業(不太理解這句話的意思...)

### 進度提示器

每一個利用 Livewire 進行檔案上傳的 <input> 輸入項會發送 JavaScript 事件讓你能夠自定義JS程式來進行監聽

以下是會發送的事件:



| 事件 | 描述 |
| -------- | -------- |
| livewire-upload-start     | 當開始上傳時發出     |
| livewire-upload-finish     | 當上傳順利結束後發出     |
| livewire-upload-error     | 當上傳因不明原因失敗時發出     |
| livewire-upload-progress     | 在上傳過程中發出，會附帶目前進度，以百分比的形式     |

這是一個結合 AlpineJS 的 Livewire 檔案上傳組件，示範如何顯示進度條

```
<div
    x-data="{ isUploading: false, progress: 0 }"
    x-on:livewire-upload-start="isUploading = true"
    x-on:livewire-upload-finish="isUploading = false"
    x-on:livewire-upload-error="isUploading = false"
    x-on:livewire-upload-progress="progress = $event.detail.progress"
>
    <!-- File Input -->
    <input type="file" wire:model="photo">

    <!-- Progress Bar -->
    <div x-show="isUploading">
        <progress max="100" x-bind:value="progress"></progress>
    </div>
</div>
```

### JavaScript 上傳 API

要整合第三方檔案上傳函式庫一般都需要比單純使用 "<input type="file">" 來得進行更多調整

為此， Livewire 開放其所使用的 JavaScript 函式

這個函式存在於 JavaScript 組件物件，能透過便利的 Blade 指令 : @this 來取用。假如你不是太熟悉，你可以參考這個例子:

```
<script>
    let file = document.querySelector('input[type="file"]').files[0]

    // Upload a file:
    @this.upload('photo', file, (uploadedFilename) => {
        // Success callback.
    }, () => {
        // Error callback.
    }, (event) => {
        // Progress callback.
        // event.detail.progress contains a number between 1 and 100 as the upload progresses.
    })

    // Upload multiple files:
    @this.uploadMultiple('photos', [file], successCallback, errorCallback, progressCallback)

    // Remove single file from multiple uploaded files
    @this.removeUpload('photos', uploadedFilename, successCallback)
</script>
```

### 設定

因為 Livewire 會在開發者有機會去驗證或儲存之前先暫存所有上傳檔案， Livewire 會針對所有的檔案上傳預設一些處理流程(這一句不是太理解...)

### 全域驗證

預設情況下， Livewire 將會依據以下的這些規則來驗證所有的上傳暫存檔案，file|max:12288，也就是最大不得超過 12 MB

假如你想要調整這個大小，你能在 config/livewire.php 檔案內去設定成自己想要的驗證規則，像這樣:

```
return [
    ...
    'temporary_file_upload' => [
        ...
        'rules' => 'file|mimes:png,jpg,pdf|max:102400', // (最大不超過 100MB , 只接受 png, jpeg, 和 pdf.)
        ...
    ],
];
```
### 全域中介層

暫時檔案上傳終端預設會有 throttling 中介層，但你可以透過以下的設定參數來自定義自己想要在終端使用哪些中介層

```
return [
    ...
    'temporary_file_upload' => [
        ...
        'middleware' => 'throttle:5,1', // Only allow 5 uploads per user per minute.
    ],
];
```

### 臨時上傳資料夾

暫存檔案會被上傳到指定磁碟的 livewire-tmp 資料夾，你能夠透過以下設定來自定義它

```
return [
    ...
    'temporary_file_upload' => [
        ...
        'directory' => 'tmp',
    ],
];
```


## 檔案下載

Livewire 支持透過簡單而且直觀的 API 來實作檔案下載功能

為觸發檔案下載，你能從任何一個組件行動中去回傳 Lavavel 檔案下載

```
class ExportButton extends Component
{
    public function export()
    {
        return Storage::disk('exports')->download('export.csv');
    }
}
```
```
<button wire:click="export">
    下載檔案
</button>
```

Livewire 應該會為你處理任何原先 Laravel 作檔案下載所需要的工作，這裡展示一些你可能會用到的功能:

```
return response()->download(storage_path('exports/export.csv'));
return response()->streamDownload(function () {
    echo 'CSV Contents...';
}, 'export.csv');
```

## 查詢字串

有時候在組件狀態改變時去更新瀏覽器的查詢字串是有必要的

例如你打造一個 "search posts" 組件，並且希望查詢字串能夠反應出當前的查詢內容為何

`https://your-app.com/search-posts?search=some-search-string`

這樣的話，當使用者點下返回鍵或者是將頁面加入最愛，就能夠透過查詢字串來回到當前狀態，而不是每次都要重新設定組件的狀態

為了達到這樣的目的，你能夠加入 protected $queryString 這樣的屬性，這樣的話 Livewire 將會隨著每次屬性的改動進而修改查詢字串，反過來說當查詢字串改變時也會改動這個屬性的值

```
class SearchPosts extends Component
{
    public $search;

    protected $queryString = ['search'];

    public function render()
    {
        return view('livewire.search-posts', [
            'posts' => Post::where('title', 'like', '%'.$this->search.'%')->get(),
        ]);
    }
}
```
```
<div>
    <input wire:model="search" type="search" placeholder="Search posts by title...">

    <h1>Search Results:</h1>

    <ul>
        @foreach($posts as $post)
            <li>{{ $post->title }}</li>
        @endforeach
    </ul>
</div>
```

### 保持乾淨的查詢字串

根據上面的例子，當 search 屬性是空的時，查詢字串看起來像這樣:

`?search=`

有一些其他狀況是你希望只有在它不是預設設定時才代表查詢字串的值

例如，假如你有一個 $page 屬性用來追蹤組件的分頁數，你可能會希望當頁面為首頁時從查詢字串上拿掉 page 屬性，這時你可以使用以下的語法:

```
class SearchPosts extends Component
{
    public $foo;
    public $search = '';
    public $page = 1;

    protected $queryString = [
        'foo',
        'search' => ['except' => ''],
        'page' => ['except' => 1],
    ];

    public function mount()
    {
        $this->fill(request()->only('search', 'page'));
    }

    ...
}
```


## 授權

要在 Livewire 進行授權的驗證，你能夠在任何組件裡頭去使用 AuthorizesRequests trait，接著在行動中去呼叫 $this->authorize()，就如同以前在控制器裡頭那樣的寫法，例如:

```
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EditPost extends \Livewire\Component
{
    use AuthorizesRequests;

    public $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    public function save()
    {
        $this->authorize('update', $this->post);

        $this->post->update(['title' => $this->title]);
    }
}
```

假如你使用了不同的 guard 來驗證你的使用者，那麼你也要加入一個實體到 livewire 設定檔的 middleware_group:

```
...
'middleware_group' => ['web', 'auth:otherguard'],
...
```

## 分頁

Livewire 讓你得以在組件中去為顯示結果進行分頁，這個功能會導用 Laravel 內建的分頁功能，因此這個功能會讓你感覺不到它的存在


### 資料分頁

比如你有一個 show-posts 組件，但你希望限制每頁只顯示最多10篇文章

你能夠透過 Livewire 所提供的 WithPagination trait 來進行結果分頁

```
use Livewire\WithPagination;

class ShowPosts extends Component
{
    use WithPagination;

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Post::paginate(10),
        ]);
    }
}
```
```
<div>
    @foreach ($posts as $post)
        ...
    @endforeach

    {{ $posts->links() }}
</div>
```

現在每一頁的底部將會顯示不同的分頁連結介面，而且顯示結果也會予以分頁

### 在過濾資料後重新進行分頁

一種常見的需求是當使用者進行資料過濾操作之後，分頁應該跳回第一頁，分頁結果也跟著重設

例如，假如使用者正位在分頁的第4頁，這時他在搜尋欄輸入關鍵字來進一步縮小查詢範圍，這時候往往使用者會預期分頁應該跳回第1頁

Livewire 的 WithPagination trait 釋出 resetPage() 來協助你達成這個功能

這個方法能夠搭配 updating/updated 生命週期 hooks 以便於在某些組件資料更新時去重設當前分頁

```
use Livewire\WithPagination;

class ShowPosts extends Component
{
    use WithPagination;

    public $search = '';

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Post::where('title', 'like', '%'.$this->search.'%')->paginate(10),
        ]);
    }
}
```

### 使用 Bootstrap 分頁主題

就像是 Laravel 那樣， Livewire 的預設分頁視圖是使用 Tailwind 類別來設定樣式。假如你希望在應用裡頭使用 Bootstrap，你能夠使用組件的 $paginationTheme 屬性來在分頁視圖上啟用 Bootstrap 主題

```
class ShowPosts extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';
```

### 使用自定義的分頁視圖

Livewire 提供了兩種方式來自定義分頁連結視圖，會在呼叫 $results->links() 後進行渲染

方法 A:直接將視圖名稱傳入 links()

```
<div>
    @foreach ($posts as $post)
        ...
    @endforeach

    {{ $posts->links('custom-pagination-links-view') }}
</div>
```

方法 B:在你的組件去複寫 paginationView()

```
class ShowPosts extends Component
{
    use WithPagination;

    ...

    public function paginationView()
    {
        return 'custom-pagination-links-view';
    }

    ...
}
```

方法 C:發布 Livewire 的分頁視圖

你能夠透過以下的 Artisan 命令來發布 Livewire 的分頁視圖到 resources/views/vendor/livewire

`php artisan livewire:publish --pagination`

> 很遺憾的，Livewire 將會覆寫你定義在服務供應器，使用 Paginator:defaultView() 的自定義視圖

一旦你採用以上的任何一個方法，你應該使用 wire:click 搭配以下方法來跳轉分頁，而不是在你的分頁組件去使用 anchor 標籤



| 方法 | 說明 |
| -------- | -------- | 
| nextPage()   | 跳至下一頁     | 
| previousPage()     | 跳至上一頁     | 
| gotoPage($page)     | 跳至指定頁     | 

看看下面的例子來了解預設的 Livewire 分頁器是如何運作的

```
@if ($paginator->hasPages())
    <nav role="navigation" aria-label="Pagination Navigation" class="flex justify-between">
        {{-- Previous Page Link --}}
        @if ($paginator->onFirstPage())
            <span class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 rounded-md">
                {!! __('pagination.previous') !!}
            </span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}" rel="prev" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
                {!! __('pagination.previous') !!}
            </a>
        @endif

        {{-- Next Page Link --}}
        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}" rel="next" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
                {!! __('pagination.next') !!}
            </a>
        @else
            <span class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 rounded-md">
                {!! __('pagination.next') !!}
            </span>
        @endif
    </nav>
@endif
```

## 轉址

你可能想要透過 Livewire 組件讓你在應用裡去轉址到其他頁面，Livewire 支持你用在 Laravel 控制器的標準轉址回應語法

```
class ContactForm extends Component
{
    public $email;

    public function addContact()
    {
        Contact::create(['email' => $this->email]);

        return redirect()->to('/contact-form-success');
    }
}
```
```
<div>
    Email: <input wire:model="email">

    <button wire:click="addContact">Submit</button>
</div>
```

現在，當使用者點下 "submit"按鈕且聯絡單的內容寫入資料庫之後，使用者將會被轉到成功頁面(/contact-form-success)

因為 Livewire 搭配 Laravel的轉址系統在運作，你可以使用所有先前在 Laravel 所用過的寫法，像是redirect('/foo'), redirect()->to('/foo'), redirect()->route('foo')

## 快閃訊息

假如你需要顯示成功或者是錯誤的訊息讓使用者知道，這就是你需要的功能了。 Livewire 採用和 Laravel 相同的做法，也就是將快閃資料存在 Session 裡頭

這是一個常見的快閃訊息例子：

```
class UpdatePost extends Component
{
    public Post $post;

    protected $rules = [
        'post.title' => 'required',
    ];

    public function update()
    {
        $this->validate();

        $this->post->save();

        session()->flash('message', '文章更新成功！！');
    }
}
```
```
<form wire:submit.prevent="update">
    <div>
        @if (session()->has('message'))
            <div class="alert alert-success">
                {{ session('message') }}
            </div>
        @endif
    </div>

    Title: <input wire:model="post.title" type="text">

    <button>Save</button>
</form>
```

現在，當使用者按下 "Save" 按鈕且文章被更新之後，使用者將會看到 "文章更新成功！！" 的這個訊息顯示在頁面上

假如你想要的是轉址到目標頁面才顯示訊息的話， Livewire 會很聰明的為你保留這個快閃訊息到下一個請求，下面是一個例子:

```
public function update()
{
    $this->validate();

    $this->post->save();

    session()->flash('message', 'Post successfully updated.');

    return redirect()->to('/posts');
}
```

現在當使用者儲存一個文章，他們將會被轉址到 "/posts" 這個網址，然後在那個頁面看到快閃訊息。當然這前提是 "/posts" 頁面具有支持的 Blade 程式片段用來顯示快閃訊息才行

## Traits

PHP Traits 是用來在多個 Livewire 組件之間重用程式碼非常好用的方式

例如，你可能想要有多個 "data table" 組件在你的應用裡頭，它們都共同使用相同的邏輯來進行排序

與其複製以下的這些排序邏輯到每一個組件裡頭，你應該試試其他更好的做法:

```
class ShowPosts extends Component
{
    public $sortBy = '';
    public $sortDirection = 'asc';

    public function sortBy($field)
    {
        $this->sortDirection = $this->sortBy === $field
            ? $this->reverseSort()
            : 'asc';

        $this->sortBy = $field;
    }

    public function reverseSort()
    {
        return $this->sortDirection === 'asc'
            ? 'desc'
            : 'asc';
    }

    ...
}
```

你可以把這些程式碼轉到一個可重複利用的 trait ，取名為 WithSorting :

```
class ShowPosts extends Component
{
    use WithSorting;

    ...
}
```
```
trait WithSorting
{
    public $sortBy = '';
    public $sortDirection = 'asc';

    public function sortBy($field)
    {
        $this->sortDirection = $this->sortBy === $field
            ? $this->reverseSort();
            : 'asc';

        $this->sortBy = $field;
    }

    public function reverseSort()
    {
        return $this->sortDirection === 'asc'
            ? 'desc'
            : 'asc';
    }
}
```

除此之外，假如你想要在你的 trait 裡頭去使用 Livewire 的 hook 同時也想要在組件裡頭使用 hook。沒問題， Livewire 提供了一個語法來允許你這麼做

```
trait WithSorting
{
    ...

    public function mountWithSorting()
    {
        //
    }

    public function updatingWithSorting($name, $value)
    {
        //
    }

    public function updatedWithSorting($name, $value)
    {
        //
    }

    public function hydrateWithSorting()
    {
        //
    }

    public function dehydrateWithSorting()
    {
        //
    }

    public function renderingWithSorting()
    {
        //
    }

    public function renderedWithSorting($view)
    {
        //
    }
}
```