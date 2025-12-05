// app/lists/_layout.tsx
// Layout for lists routes

import { Stack } from 'expo-router';

export default function ListsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'List Details',
          headerBackTitle: 'All Lists',
        }}
      />
      <Stack.Screen
        name="[id]/coin/[coinId]"
        options={{
          title: 'Coin Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

