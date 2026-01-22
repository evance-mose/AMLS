<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('expertise')->nullable()->after('status')->comment('Array of issue categories the technician is expert in');
            $table->enum('availability', ['available', 'busy', 'unavailable'])->default('available')->after('expertise');
        });
    }
    
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['expertise', 'availability']);
        });
    }
};
