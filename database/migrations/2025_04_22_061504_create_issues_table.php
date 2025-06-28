<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('location');
            $table->string('atm_id');
            $table->enum('category', ['dispenser_errors', 'card_reader_errors', 'receipt_printer_errors', 'epp_errors', 'pc_core_errors', 'journal_printer_errors', 'recycling_module_errors', 'other']);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'acknowledged', 'resolved', 'closed'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
