import * as Slot from '@rn-primitives/slot';
import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View } from 'react-native';
import type {
  SliderRangeProps,
  SliderRootProps,
  SliderThumbProps,
  SliderTrackProps,
} from './types';

const RootContext = React.createContext<SliderRootProps | null>(null);

const Root = React.forwardRef<ViewRef, SliderRootProps>(
  (
    {
      asChild,
      value,
      disabled,
      min,
      max,
      dir: _dir,
      inverted: _inverted,
      step: _step,
      onValueChange: _onValueChange,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot.View : View;
    return (
      <RootContext.Provider value={{ value, disabled, min, max }}>
        <Component ref={ref} role='group' {...props} />
      </RootContext.Provider>
    );
  }
);

Root.displayName = 'RootNativeSlider';

function useSliderContext() {
  const context = React.useContext(RootContext);
  if (context === null) {
    throw new Error('Slider compound components cannot be rendered outside the Slider component');
  }
  return context;
}

const Track = React.forwardRef<ViewRef, SliderTrackProps>(({ asChild, ...props }, ref) => {
  const { value, min, max, disabled } = useSliderContext();

  const Component = asChild ? Slot.View : View;
  return (
    <Component
      ref={ref}
      aria-disabled={disabled}
      role='slider'
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      accessibilityValue={{ max, min, now: value }}
      {...props}
    />
  );
});

Track.displayName = 'TrackNativeSlider';

const Range = React.forwardRef<ViewRef, SliderRangeProps>(({ asChild, ...props }, ref) => {
  const Component = asChild ? Slot.View : View;
  return <Component ref={ref} role='presentation' {...props} />;
});

Range.displayName = 'RangeNativeSlider';

const Thumb = React.forwardRef<ViewRef, SliderThumbProps>(({ asChild, ...props }, ref) => {
  const Component = asChild ? Slot.View : View;
  return <Component accessibilityRole='adjustable' ref={ref} {...props} />;
});

Thumb.displayName = 'ThumbNativeSlider';

export { Range, Root, Thumb, Track };
