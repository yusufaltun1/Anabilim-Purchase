import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  DateTimeField,
  EmptyState,
  ErrorBanner,
  Input,
  Loading,
  MultiSelect,
  NumberInput,
  Screen,
  ScreenHeader,
  Section,
  SegmentedControl,
  Select,
  Switch,
  Text,
  TextArea,
  useToast,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

const DEMO_OPTIONS = Array.from({ length: 40 }, (_, i) => ({
  label: `Seçenek ${i + 1}`,
  value: String(i + 1),
}));

export default function UiKitScreen() {
  const { spacing } = useAppTheme();
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [qty, setQty] = useState<number | null>(1);
  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(true);
  const [date, setDate] = useState<Date | null>(null);
  const [tab, setTab] = useState('zimmet');
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showError, setShowError] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: 'UI Kit', headerShown: false }} />
      <Screen scroll>
        <ScreenHeader title="Shared UI Kit" subtitle="ZW-122 katalog" />

        <Section title="Tipografi">
          <Text variant="h1">Başlık H1</Text>
          <Text variant="h2">Başlık H2</Text>
          <Text variant="h3">Başlık H3</Text>
          <Text variant="subtitle">Alt başlık</Text>
          <Text variant="body">Body metin</Text>
          <Text variant="caption">Caption / yardımcı</Text>
          <Text variant="error">Hata metni</Text>
        </Section>

        <Section title="Butonlar">
          <View style={{ gap: spacing.sm }}>
            <Button title="Primary" onPress={() => showToast({ message: 'Primary tıklandı', tone: 'success' })} />
            <Button title="Secondary" variant="secondary" onPress={() => undefined} />
            <Button title="Outline" variant="outline" onPress={() => undefined} />
            <Button title="Ghost" variant="ghost" onPress={() => undefined} />
            <Button title="Destructive" variant="destructive" onPress={() => setConfirmOpen(true)} />
            <Button
              title="Loading"
              loading={loadingBtn}
              onPress={() => {
                setLoadingBtn(true);
                setTimeout(() => setLoadingBtn(false), 1500);
              }}
            />
            <Button title="Disabled" disabled onPress={() => undefined} />
          </View>
        </Section>

        <Section title="Form" description="Label + input + select + submit örneği">
          <Card>
            <Input
              label="E-posta"
              required
              placeholder="ornek@anabilim.com"
              value={text}
              onChangeText={setText}
              helper="Kurumsal e-posta adresiniz"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Şifre"
              required
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showPasswordToggle
              error={password.length > 0 && password.length < 4 ? 'En az 4 karakter' : undefined}
            />
            <TextArea label="Not" value={note} onChangeText={setNote} placeholder="Açıklama yazın" />
            <NumberInput label="Miktar" value={qty} onChangeValue={setQty} min={0} max={999} />
            <Select
              label="Depo"
              required
              options={DEMO_OPTIONS}
              value={single}
              onChange={setSingle}
              searchable
              clearable
            />
            <MultiSelect
              label="Kategoriler"
              options={DEMO_OPTIONS.slice(0, 12)}
              value={multi}
              onChange={setMulti}
            />
            <DateTimeField label="Beklenen iade" value={date} onChange={setDate} mode="date" />
            <Checkbox label="Onaylıyorum" checked={checked} onChange={setChecked} />
            <Switch label="Aktif" helper="Kayıt sistemde görünsün" value={active} onChange={setActive} />
            <Button
              title="Kaydet"
              fullWidth
              onPress={() =>
                showToast({
                  message: single ? `Seçim: ${single}` : 'Depo seçiniz',
                  tone: single ? 'success' : 'error',
                })
              }
            />
          </Card>
        </Section>

        <Section title="Segmented / Badge">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { key: 'zimmet', label: 'Zimmet', icon: 'person-outline' },
              { key: 'hareket', label: 'Hareket', icon: 'swap-horizontal-outline' },
              { key: 'gecmis', label: 'Geçmiş', icon: 'time-outline' },
            ]}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            <Badge label="Aktif" tone="success" />
            <Badge label="Zimmetli" tone="primary" />
            <Badge label="Hazır" tone="info" />
            <Badge label="Arızalı" tone="warning" />
            <Badge label="İptal" tone="error" />
          </View>
        </Section>

        <Section title="Feedback">
          {showError ? (
            <ErrorBanner
              message="Örnek hata bandı"
              onRetry={() => showToast('Yeniden denendi')}
              onDismiss={() => setShowError(false)}
            />
          ) : null}
          <Loading label="Yükleniyor…" />
          <EmptyState
            title="Kayıt yok"
            description="Henüz veri bulunmuyor."
            actionTitle="Yeni ekle"
            onAction={() => showToast({ message: 'Yeni ekle', tone: 'info' })}
          />
        </Section>

        <ConfirmDialog
          visible={confirmOpen}
          title="Silinsin mi?"
          message="Bu işlem geri alınamaz."
          confirmTitle="Sil"
          destructive
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            showToast({ message: 'Silindi', tone: 'success' });
          }}
        />
      </Screen>
    </>
  );
}
