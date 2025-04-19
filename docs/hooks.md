# Custom Hooks (`src/hooks/`)

This directory contains custom React hooks used throughout the application to encapsulate reusable logic, state management, and side effects.

## Available Hooks

### `useIsMobile()` (`src/hooks/use-mobile.tsx`)

-   **Purpose:** Determines if the current browser window width corresponds to a mobile device viewport.
-   **Logic:**
    -   Defines a constant `MOBILE_BREAKPOINT` (set to 768 pixels).
    -   Uses `React.useState` to store the `isMobile` boolean state (initially `undefined`).
    -   Uses `React.useEffect` to:
        -   Create a `window.matchMedia` query for screens with a max-width less than the breakpoint.
        -   Set the initial `isMobile` state based on the current `window.innerWidth`.
        -   Add an event listener to the media query list (`mql`) that updates the `isMobile` state whenever the viewport width crosses the breakpoint.
        -   Return a cleanup function to remove the event listener when the component unmounts.
-   **Returns:** A boolean value (`true` if the viewport width is less than the mobile breakpoint, `false` otherwise).
-   **Usage:**
    ```typescript
    import { useIsMobile } from '@/hooks/use-mobile';

    function ResponsiveComponent() {
      const isMobile = useIsMobile();

      if (isMobile) {
        return <div>Mobile View</div>;
      } else {
        return <div>Desktop View</div>;
      }
    }
    ```

### `useToast()` (`src/hooks/use-toast.ts`)

-   **Purpose:** Provides a way to display toast notifications using the `Toast` components from `src/components/ui/toast.tsx` and `src/components/ui/toaster.tsx`.
-   **Inspiration:** Based on the `react-hot-toast` library.
-   **Features:**
    -   Manages a global state for active toasts.
    -   Provides a `toast()` function to trigger new notifications.
    -   Provides a `dismiss()` function to programmatically close toasts.
    -   Limits the number of simultaneously visible toasts (`TOAST_LIMIT`).
    -   Handles automatic removal of toasts after a delay (`TOAST_REMOVE_DELAY`).
    -   Allows updating existing toasts.
-   **Implementation Details:**
    -   Uses a reducer (`reducer`) to manage toast state transitions (add, update, dismiss, remove).
    -   Maintains a global state (`memoryState`) and a list of listeners (`listeners`) to update components using the hook.
    -   Generates unique IDs for each toast.
-   **Returns:** An object containing:
    -   `toasts`: An array of the current toast objects.
    -   `toast`: The function to call to display a new toast notification.
    -   `dismiss`: The function to call to dismiss a toast (optionally by ID).
-   **Associated `toast()` function:**
    -   **Purpose:** A standalone function (also exported) that can be used outside of React components to trigger toasts.
    -   **Parameters:** An object containing toast properties (`title`, `description`, `variant`, `action`, etc.), same as the props for the `Toast` component.
    -   **Returns:** An object with `id`, `dismiss()`, and `update()` methods for the specific toast instance.
-   **Usage:**
    ```typescript
    import { useToast } from '@/hooks/use-toast';
    import { Button } from '@/components/ui/button';

    function ToastButton() {
      const { toast } = useToast();

      return (
        <Button
          onClick={() => {
            toast({
              title: 'Scheduled: Catch up',
              description: 'Friday, February 10, 2023 at 5:57 PM',
              variant: 'success', // Example variant
            });
          }}
        >
          Show Toast
        </Button>
      );
    }
    ```
    *Note: Requires the `<Toaster />` component to be rendered somewhere in your application tree (usually in the root layout) to display the toasts.*