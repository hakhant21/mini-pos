<?php

namespace App\Services;

use App\Models\Printer;
use App\Models\Sale;

class ReceiptPrinter
{
    /** Initialize printer. */
    public const INIT = "\x1b\x40";

    /** Align commands. */
    public const ALIGN_LEFT = "\x1b\x61\x00";

    public const ALIGN_CENTER = "\x1b\x61\x01";

    /** Bold on/off. */
    public const BOLD_ON = "\x1b\x45\x01";

    public const BOLD_OFF = "\x1b\x45\x00";

    /** Double height/width on/off (ESC ! n). */
    public const DOUBLE_ON = "\x1b\x21\x30";

    public const DOUBLE_OFF = "\x1b\x21\x00";

    /** Feed and partial cut. */
    public const FEED_AND_CUT = "\x1d\x56\x42\x00";

    /** Partial cut only. */
    public const CUT = "\x1d\x56\x41\x00";

    public function printSale(Sale $sale): void
    {
        try {
            $settings = Printer::current();

            if (! $settings->enabled) {
                return;
            }

            $data = $this->buildCopies($sale, $settings->copies ?: 1, $settings->auto_cut);

            $payload = json_encode([
                'data' => base64_encode($data),
                'device_address' => $settings->device_address,
                'device_name' => $settings->device_name,
            ]);

            if (function_exists('nativephp_call')) {
                nativephp_call('Printer.EnsurePermission', '{}');
                nativephp_call('Printer.Print', (string) $payload);
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public function buildCopies(Sale $sale, int $copies = 2, bool $autoCut = true): string
    {
        $out = '';
        $copies = max(1, $copies);

        for ($i = 0; $i < $copies; $i++) {
            $out .= $this->build($sale);
            $out .= $autoCut ? self::FEED_AND_CUT : "\n\n\n";
        }

        return $out;
    }

    public function build(Sale $sale): string
    {
        $sale->loadMissing(['items', 'user']);

        $printer = Printer::current();
        $shopName = $printer->name ?: strtoupper(config('app.name', 'MY SHOP'));

        $out = self::INIT;
        $out .= self::ALIGN_CENTER;
        $out .= self::DOUBLE_ON.$this->text($shopName).self::DOUBLE_OFF;
        $out .= $printer->address ? $this->text($printer->address) : '';
        $phones = array_filter([$printer->phone_one, $printer->phone_two]);
        $out .= $phones ? $this->text('Tel: '.implode(' / ', $phones)) : '';
        $out .= $this->text(str_repeat('-', 32));
        $out .= self::ALIGN_LEFT;
        $out .= $this->text('Invoice: '.$sale->invoice_number);
        $out .= $this->text('Date: '.$sale->created_at?->format('d/m/Y H:i:s'));
        $out .= $this->text('Cashier: '.($sale->user->name ?? '-'));
        $out .= $this->text(str_repeat('-', 32));
        $out .= self::BOLD_ON.$this->text('Item'.$this->pad('', 13).$this->pad('Total', 10, STR_PAD_LEFT)).self::BOLD_OFF;

        foreach ($sale->items as $item) {
            $out .= $this->text($this->truncate($item->product_name, 32));
            $variant = $this->truncate(trim(implode(' ', array_filter([$item->variant_name, $item->unit_name]))), 22);
            $detail = $this->pad($variant, 22);
            $detail .= $this->pad(number_format((float) $item->quantity, 0).' @ '.number_format((float) $item->unit_price, 0), 13, STR_PAD_LEFT);
            $out .= $this->text($detail.$this->pad(number_format((float) $item->total_price, 0), 9, STR_PAD_LEFT));
        }

        $out .= $this->text(str_repeat('-', 32));

        if ((float) $sale->discount > 0) {
            $out .= $this->text($this->row('Discount', '-'.number_format((float) $sale->discount, 0)));
        }

        if ((float) $sale->tax > 0) {
            $out .= $this->text($this->row('Tax', '+'.number_format((float) $sale->tax, 0)));
        }

        $out .= self::ALIGN_CENTER;
        $out .= self::BOLD_ON.self::DOUBLE_ON.$this->text('TOTAL '.number_format((float) $sale->total_amount, 0)).self::DOUBLE_OFF.self::BOLD_OFF;
        $out .= self::ALIGN_LEFT;
        $out .= $this->text(str_repeat('-', 32));
        $out .= $this->text($this->row('Cash', number_format((float) $sale->amount_paid, 0)));
        $out .= $this->text($this->row('Change', number_format((float) $sale->change, 0)));
        $out .= $this->text($this->row('Payment', ucfirst(str_replace('_', ' ', $sale->payment_method))));
        $out .= $this->text(' ');
        $out .= self::ALIGN_CENTER;
        $out .= $this->text('Thank you!');
        $out .= $this->text(' ');

        return $out;
    }

    private function text(string $line): string
    {
        return $line."\n";
    }

    private function row(string $left, string $right): string
    {
        return $this->pad($left, 22).$this->pad($right, 10, STR_PAD_LEFT);
    }

    private function pad(string $value, int $width, int $padType = STR_PAD_RIGHT): string
    {
        return mb_str_pad($value, $width, ' ', $padType);
    }

    private function truncate(string $value, int $width): string
    {
        return mb_substr($value, 0, $width);
    }
}
