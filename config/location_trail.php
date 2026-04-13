<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default admin list window (hours)
    |--------------------------------------------------------------------------
    */
    'default_list_hours' => (int) env('LOCATION_TRAIL_DEFAULT_LIST_HOURS', 72),

    /*
    |--------------------------------------------------------------------------
    | Retention: delete points older than this many days (prune command)
    |--------------------------------------------------------------------------
    */
    'retention_days' => (int) env('LOCATION_TRAIL_RETENTION_DAYS', 90),
];
