package com.anabilim.purchase.dto.request;

import lombok.Data;

@Data
public class CreateDeviceModelDto {
    private String name;
    private String brand;
    private Long categoryId;
    private Boolean enableIp;
    private Boolean enableMac;
}
