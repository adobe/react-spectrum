# Illustrations

React Spectrum offers a collection of illustrations that can be imported from .

```tsx
import Cloud from "@react-spectrum/s2/illustrations/gradient/generic1/Cloud";

<Cloud />
```

## Available illustrations

* 3D
* 3Dasset
* Accessibility
* Addproject
* AIchat
* AIChat
* AIGenerate
* AIGenerateImage
* AlertNotice
* Animation
* Apps
* ArrowDown
* ArrowLeft
* ArrowRight
* ArrowUp
* Artboard
* Assets
* AudioWave
* BadgeVerified
* Bell
* Bolt
* Brand
* Briefcase
* BrightnessContrast
* Browser
* BrowserError
* BrowserNotCompatible
* Brush
* Bug
* Buildings
* BuildTable
* Calendar
* Camera
* CardTapPayment
* Channel
* ChartAreaStack
* Chatbubble
* Check
* Checkmark
* Clipboard
* Clock
* Close
* Cloud
* CloudStateDisconnected
* CloudStateError
* CloudUpload
* CodeBrackets
* Color
* CommentText
* Confetti
* ConfettiCelebration
* Conversationbubbles
* Crop
* Cursor
* Cut
* Data
* DataAnalytics
* Desktop
* Diamond
* Document
* Download
* DropToUpload
* Education
* Effects
* Emoji
* Emoji160
* EmptyStateExport
* Error
* Explosion
* ExportTo
* Exposure
* FileAlert
* FileImage
* FileShared
* FileText
* FileVideo
* FileZip
* Filmstrip
* Filter
* Filters
* Fireworks
* Flag
* FlagCheckmark
* FlagCross
* FolderClose
* FolderOpen
* FolderShared
* GearSetting
* Gift
* Globe
* GlobeGrid
* GraphBarChart
* Hand
* Handshake
* Heart
* HelpCircle
* Home
* Illustration
* Image
* ImageStack
* InfiniteLooping
* Information
* Interaction
* Laptop
* Layers
* Libraries
* Lightbulb
* LightbulbRays
* Lighten
* Link
* Location
* LockClose
* LockOpen
* Logo
* MagicWand
* MailClose
* MailOpen
* Market
* MegaphonePromote
* MegaphonePromote2
* MegaphonePromoteExpressive
* Mention
* Microphone
* MicrophoneOff
* Minimize
* MovieCamera
* MusicNote
* NoBrands
* NoComment
* NoComments
* NoElements
* NoFile
* NoFilter
* NoImage
* NoInternetConnection
* NoLibraries
* NoLibrariesBrands
* NoReviewLinks
* NoSearchResults
* NoSharedFile
* Paperairplane
* Paperclip
* Pause
* Pencil
* Phone
* PieChart
* PiggyBank
* Pin
* Play
* PlayTriangle
* Plugin
* Prompt
* Properties
* Redo
* Remix
* Replace
* ReportAbuse
* Revert
* Ribbon
* Rocket
* RotateCCW
* RotateCW
* Ruler
* Search
* Segmentation
* Server
* Shapes
* ShoppingBag
* ShoppingCart
* SocialPost
* Sparkles
* SpeedFast
* StampClone
* Star
* StepForward
* Stopwatch
* Switch
* Tablet
* Tag
* Targeted
* Text
* ThreeArrowsCircle
* ThumbsDown
* ThumbsUp
* Transform
* Translate
* Trash
* Trophy
* Update
* Upload
* User
* UserAvatar
* UserGroup
* VectorDraw
* Video
* Volume
* VolumeOff
* VolumeOne
* Wallet
* Warning

## Custom illustrations

To use custom illustrations, you first need to convert your SVGs into compatible illustration components. This depends on your bundler.

### Parcel

If you are using Parcel, the `@react-spectrum/parcel-transformer-s2-icon` plugin can be used to convert SVGs to illustration components. First install it into your project as a dev dependency:

```bash
npm install @react-spectrum/parcel-transformer-s2-icon --dev
```

Then, add it to your `.parcelrc`:

```tsx
{
  extends: "@parcel/config-default",
  transformers: {
    "illustration:*.svg": ["@react-spectrum/parcel-transformer-s2-icon"]
  }
}
```

Now you can import illustration SVGs using the `illustration:` [pipeline](https://parceljs.org/features/plugins/#named-pipelines):

```tsx
import Illustration from 'illustration:./path/to/Illustration.svg';
```

Note that you must use the name `illustration` for the pipeline.

### Other bundlers

The `@react-spectrum/s2-icon-builder` CLI tool can be used to pre-process a folder of SVG illustrations into TSX files.

```bash
npx @react-spectrum/s2-icon-builder -i 'path/to/illustrations/*.svg' --type illustration -o 'path/to/destination'
```

This outputs a folder of TSX files with names corresponding to the input SVG files. You may rename them as you wish. To use them in your application, import them like normal components.

```tsx
import Illustration from './path/to/destination/Illustration';
```
