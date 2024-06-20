import * as HoverCard from '@radix-ui/react-hover-card';
import { useAugmentedRef } from '@rn-primitives/hooks';
import * as Slot from '@rn-primitives/slot';
import type {
  PositionedContentProps,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from '@rn-primitives/types';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type {
  HoverCardOverlayProps,
  HoverCardPortalProps,
  HoverCardRootProps,
  HoverCardTriggerRef,
  HoverCardRootContext,
} from './types';

const HoverCardContext = React.createContext<HoverCardRootContext | null>(null);

const Root = React.forwardRef<ViewRef, SlottableViewProps & HoverCardRootProps>(
  (
    { asChild, openDelay, closeDelay, onOpenChange: onOpenChangeProp, style, ...viewProps },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    function onOpenChange(value: boolean) {
      setOpen(value);
      onOpenChangeProp?.(value);
    }

    const Component = asChild ? Slot.View : View;
    return (
      <HoverCardContext.Provider value={{ open, onOpenChange }}>
        <HoverCard.Root
          open={open}
          onOpenChange={onOpenChange}
          openDelay={openDelay}
          closeDelay={closeDelay}
        >
          <Component ref={ref} style={StyleSheet.flatten(style)} {...viewProps} />
        </HoverCard.Root>
      </HoverCardContext.Provider>
    );
  }
);

Root.displayName = 'RootWebHoverCard';

function useRootContext() {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error(
      'HoverCard compound components cannot be rendered outside the HoverCard component'
    );
  }
  return context;
}

const Trigger = React.forwardRef<HoverCardTriggerRef, SlottablePressableProps>(
  ({ asChild, style, ...props }, ref) => {
    const { onOpenChange } = useRootContext();
    const augmentedRef = useAugmentedRef({
      ref,
      methods: {
        open() {
          onOpenChange(true);
        },
        close() {
          onOpenChange(false);
        },
      },
    });

    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <HoverCard.Trigger asChild>
        <Component ref={augmentedRef} style={StyleSheet.flatten(style)} {...props} />
      </HoverCard.Trigger>
    );
  }
);

Trigger.displayName = 'TriggerWebHoverCard';

function Portal({ forceMount, container, children }: HoverCardPortalProps) {
  return <HoverCard.Portal forceMount={forceMount} container={container} children={children} />;
}

const Overlay = React.forwardRef<PressableRef, SlottablePressableProps & HoverCardOverlayProps>(
  ({ asChild, style, ...props }, ref) => {
    const Component = asChild ? Slot.Pressable : Pressable;
    return <Component ref={ref} style={StyleSheet.flatten(style)} {...props} />;
  }
);

Overlay.displayName = 'OverlayWebHoverCard';

const Content = React.forwardRef<PressableRef, SlottablePressableProps & PositionedContentProps>(
  (
    {
      asChild = false,
      forceMount,
      align,
      side,
      sideOffset,
      alignOffset = 0,
      avoidCollisions = true,
      insets,
      loop: _loop,
      onCloseAutoFocus: _onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      collisionBoundary,
      sticky,
      hideWhenDetached,
      style,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <HoverCard.Content
        forceMount={forceMount}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionPadding={insets}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={onFocusOutside}
        onInteractOutside={onInteractOutside}
        collisionBoundary={collisionBoundary}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <Component ref={ref} style={StyleSheet.flatten(style)} {...props} />
      </HoverCard.Content>
    );
  }
);

Content.displayName = 'ContentWebHoverCard';

export { Content, Overlay, Portal, Root, Trigger, useRootContext };

export type { HoverCardTriggerRef };
