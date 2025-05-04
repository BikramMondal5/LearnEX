# 3D Cube Loader Component

A modern 3D spinning cube loader component for your application.

## Features

- Customizable sizes: small, default, large
- Customizable colors: blue, purple, cyan
- Smooth 3D animation
- Styled-components implementation

## Usage

The Loader is a standalone component that needs to be properly centered in a container to display correctly. 

### Basic Usage

```tsx
import Loader from "@/components/ui/cube-loader"

// Always wrap with a flex container for proper centering
<div className="flex items-center justify-center h-16 w-16">
  <Loader />
</div>
```

### Size Options

```tsx
// Small
<div className="flex items-center justify-center h-10 w-10">
  <Loader size="sm" />
</div>

// Default (medium)
<div className="flex items-center justify-center h-16 w-16">
  <Loader size="default" />
</div>

// Large
<div className="flex items-center justify-center h-20 w-20">
  <Loader size="lg" />
</div>
```

### Color Options

```tsx
// Blue (default)
<Loader color="blue" />

// Purple
<Loader color="purple" />

// Cyan
<Loader color="cyan" />
```

### In Buttons

When using in buttons, make sure to center properly:

```tsx
<Button disabled>
  <span className="opacity-0">Processing...</span>
  <span className="absolute inset-0 flex items-center justify-center">
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center h-4 w-4">
        <Loader size="sm" color="purple" />
      </div>
      Processing...
    </div>
  </span>
</Button>
```

## Important Notes

1. Always wrap the `Loader` in a flex container with proper centering:
   ```tsx
   <div className="flex items-center justify-center h-[size] w-[size]">
     <Loader />
   </div>
   ```

2. The container should be square (equal width and height) for proper display.

3. For best results, make the container slightly larger than the loader itself.

## Example Page

Check out the example page at `/loader-example` to see all variations of the Loader in action. 