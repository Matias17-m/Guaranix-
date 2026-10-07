import { createElement } from 'react';
import { Platform } from 'react-native';
import NativeDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type { DateTimePickerEvent };

type Props = React.ComponentProps<typeof NativeDateTimePicker>;

const dosDigitos = (n: number) => String(n).padStart(2, '0');
const aTexto = (f: Date) => `${f.getFullYear()}-${dosDigitos(f.getMonth() + 1)}-${dosDigitos(f.getDate())}`;

export default function SelectorFecha(props: Props) {
  if (Platform.OS !== 'web') return <NativeDateTimePicker {...props} />;

  const { value, onChange, minimumDate, maximumDate, themeVariant } = props as any;

  return createElement('input', {
    type: 'date',
    value: aTexto(value),
    min: minimumDate ? aTexto(minimumDate) : undefined,
    max: maximumDate ? aTexto(maximumDate) : undefined,
    onChange: (e: any) => {
      const texto: string = e.target.value;
      if (!texto) return;
      const [anio, mes, dia] = texto.split('-').map(Number);
      const nueva = new Date(value);
      nueva.setFullYear(anio, mes - 1, dia);
      onChange?.({ type: 'set', nativeEvent: { timestamp: nueva.getTime() } } as DateTimePickerEvent, nueva);
    },
    style: {
      padding: 10,
      fontSize: 16,
      borderRadius: 8,
      border: '1px solid #888',
      colorScheme: themeVariant === 'dark' ? 'dark' : 'light',
    },
  });
}