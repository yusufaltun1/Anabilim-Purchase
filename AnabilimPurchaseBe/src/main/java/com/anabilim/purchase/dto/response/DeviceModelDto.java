package com.anabilim.purchase.dto.response;

import lombok.Data;

@Data
public class DeviceModelDto {
    private Long id;
    private String name;
    private String brand;
    private Long categoryId;
    private Boolean enableIp;
    private Boolean enableMac;
}
