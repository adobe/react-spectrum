/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {List, ListItem} from '../src/List';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Twitter from '../src/Icon/Twitter';

storiesOf('List', module)
  .add(
    'Default',
    () => (
      <List>
        <ListItem selected>Foo</ListItem>
        <ListItem icon={<Twitter />}>Bar</ListItem>
        <ListItem disabled>Baz</ListItem>
        <ListItem>Test</ListItem>
        <ListItem>Hi</ListItem>
      </List>
    )
  )
  .add(
    'autoFocus=true',
    () => (
      <List autoFocus>
        <ListItem>Foo</ListItem>
        <ListItem icon={<Twitter />}>Bar</ListItem>
        <ListItem disabled>Baz</ListItem>
        <ListItem selected>Test</ListItem>
        <ListItem>Hi</ListItem>
      </List>
    )
  )
  .add(
    'Scrolling',
    () => (
      <List style={{height: '326px'}}>
        <ListItem value="AF">Afghanistan</ListItem>
        <ListItem value="AX">Åland Islands</ListItem>
        <ListItem value="AL">Albania</ListItem>
        <ListItem value="DZ">Algeria</ListItem>
        <ListItem value="AS">American Samoa</ListItem>
        <ListItem value="AD">Andorra</ListItem>
        <ListItem value="AO">Angola</ListItem>
        <ListItem value="AI">Anguilla</ListItem>
        <ListItem value="AQ">Antarctica</ListItem>
        <ListItem value="AG">Antigua and Barbuda</ListItem>
        <ListItem value="AR">Argentina</ListItem>
        <ListItem value="AM">Armenia</ListItem>
        <ListItem value="AW">Aruba</ListItem>
        <ListItem value="AU">Australia</ListItem>
        <ListItem value="AT">Austria</ListItem>
        <ListItem value="AZ">Azerbaijan</ListItem>
        <ListItem value="BS">Bahamas</ListItem>
        <ListItem value="BH">Bahrain</ListItem>
        <ListItem value="BD">Bangladesh</ListItem>
        <ListItem value="BB">Barbados</ListItem>
        <ListItem value="BY">Belarus</ListItem>
        <ListItem value="BE">Belgium</ListItem>
        <ListItem value="BZ">Belize</ListItem>
        <ListItem value="BJ">Benin</ListItem>
        <ListItem value="BM">Bermuda</ListItem>
        <ListItem value="BT">Bhutan</ListItem>
        <ListItem value="BO">Bolivia, Plurinational State of</ListItem>
        <ListItem value="BQ">Bonaire, Sint Eustatius and Saba</ListItem>
        <ListItem value="BA">Bosnia and Herzegovina</ListItem>
        <ListItem value="BW">Botswana</ListItem>
        <ListItem value="BV">Bouvet Island</ListItem>
        <ListItem value="BR">Brazil</ListItem>
        <ListItem value="IO">British Indian Ocean Territory</ListItem>
        <ListItem value="BN">Brunei Darussalam</ListItem>
        <ListItem value="BG">Bulgaria</ListItem>
        <ListItem value="BF">Burkina Faso</ListItem>
        <ListItem value="BI">Burundi</ListItem>
        <ListItem value="KH">Cambodia</ListItem>
        <ListItem value="CM">Cameroon</ListItem>
        <ListItem value="CA">Canada</ListItem>
        <ListItem value="CV">Cape Verde</ListItem>
        <ListItem value="KY">Cayman Islands</ListItem>
        <ListItem value="CF">Central African Republic</ListItem>
        <ListItem value="TD">Chad</ListItem>
        <ListItem value="CL">Chile</ListItem>
        <ListItem value="CN">China</ListItem>
        <ListItem value="CX">Christmas Island</ListItem>
        <ListItem value="CC">Cocos (Keeling) Islands</ListItem>
        <ListItem value="CO">Colombia</ListItem>
        <ListItem value="KM">Comoros</ListItem>
        <ListItem value="CG">Congo</ListItem>
        <ListItem value="CD">Congo, the Democratic Republic of the</ListItem>
        <ListItem value="CK">Cook Islands</ListItem>
        <ListItem value="CR">Costa Rica</ListItem>
        <ListItem value="CI">Côte d&#39;Ivoire</ListItem>
        <ListItem value="HR">Croatia</ListItem>
        <ListItem value="CU">Cuba</ListItem>
        <ListItem value="CW">Curaçao</ListItem>
        <ListItem value="CY">Cyprus</ListItem>
        <ListItem value="CZ">Czech Republic</ListItem>
        <ListItem value="DK">Denmark</ListItem>
        <ListItem value="DJ">Djibouti</ListItem>
        <ListItem value="DM">Dominica</ListItem>
        <ListItem value="DO">Dominican Republic</ListItem>
        <ListItem value="EC">Ecuador</ListItem>
        <ListItem value="EG">Egypt</ListItem>
        <ListItem value="SV">El Salvador</ListItem>
        <ListItem value="GQ">Equatorial Guinea</ListItem>
        <ListItem value="ER">Eritrea</ListItem>
        <ListItem value="EE">Estonia</ListItem>
        <ListItem value="ET">Ethiopia</ListItem>
        <ListItem value="FK">Falkland Islands (Malvinas)</ListItem>
        <ListItem value="FO">Faroe Islands</ListItem>
        <ListItem value="FJ">Fiji</ListItem>
        <ListItem value="FI">Finland</ListItem>
        <ListItem value="FR">France</ListItem>
        <ListItem value="GF">French Guiana</ListItem>
        <ListItem value="PF">French Polynesia</ListItem>
        <ListItem value="TF">French Southern Territories</ListItem>
        <ListItem value="GA">Gabon</ListItem>
        <ListItem value="GM">Gambia</ListItem>
        <ListItem value="GE">Georgia</ListItem>
        <ListItem value="DE">Germany</ListItem>
        <ListItem value="GH">Ghana</ListItem>
        <ListItem value="GI">Gibraltar</ListItem>
        <ListItem value="GR">Greece</ListItem>
        <ListItem value="GL">Greenland</ListItem>
        <ListItem value="GD">Grenada</ListItem>
        <ListItem value="GP">Guadeloupe</ListItem>
        <ListItem value="GU">Guam</ListItem>
        <ListItem value="GT">Guatemala</ListItem>
        <ListItem value="GG">Guernsey</ListItem>
        <ListItem value="GN">Guinea</ListItem>
        <ListItem value="GW">Guinea-Bissau</ListItem>
        <ListItem value="GY">Guyana</ListItem>
        <ListItem value="HT">Haiti</ListItem>
        <ListItem value="HM">Heard Island and McDonald Islands</ListItem>
        <ListItem value="VA">Holy See (Vatican City State)</ListItem>
        <ListItem value="HN">Honduras</ListItem>
        <ListItem value="HK">Hong Kong</ListItem>
        <ListItem value="HU">Hungary</ListItem>
        <ListItem value="IS">Iceland</ListItem>
        <ListItem value="IN">India</ListItem>
        <ListItem value="ID">Indonesia</ListItem>
        <ListItem value="IR">Iran, Islamic Republic of</ListItem>
        <ListItem value="IQ">Iraq</ListItem>
        <ListItem value="IE">Ireland</ListItem>
        <ListItem value="IM">Isle of Man</ListItem>
        <ListItem value="IL">Israel</ListItem>
        <ListItem value="IT">Italy</ListItem>
        <ListItem value="JM">Jamaica</ListItem>
        <ListItem value="JP">Japan</ListItem>
        <ListItem value="JE">Jersey</ListItem>
        <ListItem value="JO">Jordan</ListItem>
        <ListItem value="KZ">Kazakhstan</ListItem>
        <ListItem value="KE">Kenya</ListItem>
        <ListItem value="KI">Kiribati</ListItem>
        <ListItem value="KP">Korea, Democratic People&#39;s Republic of</ListItem>
        <ListItem value="KR">Korea, Republic of</ListItem>
        <ListItem value="KW">Kuwait</ListItem>
        <ListItem value="KG">Kyrgyzstan</ListItem>
        <ListItem value="LA">Lao People&#39;s Democratic Republic</ListItem>
        <ListItem value="LV">Latvia</ListItem>
        <ListItem value="LB">Lebanon</ListItem>
        <ListItem value="LS">Lesotho</ListItem>
        <ListItem value="LR">Liberia</ListItem>
        <ListItem value="LY">Libya</ListItem>
        <ListItem value="LI">Liechtenstein</ListItem>
        <ListItem value="LT">Lithuania</ListItem>
        <ListItem value="LU">Luxembourg</ListItem>
        <ListItem value="MO">Macao</ListItem>
        <ListItem value="MK">Macedonia, the former Yugoslav Republic of</ListItem>
        <ListItem value="MG">Madagascar</ListItem>
        <ListItem value="MW">Malawi</ListItem>
        <ListItem value="MY">Malaysia</ListItem>
        <ListItem value="MV">Maldives</ListItem>
        <ListItem value="ML">Mali</ListItem>
        <ListItem value="MT">Malta</ListItem>
        <ListItem value="MH">Marshall Islands</ListItem>
        <ListItem value="MQ">Martinique</ListItem>
        <ListItem value="MR">Mauritania</ListItem>
        <ListItem value="MU">Mauritius</ListItem>
        <ListItem value="YT">Mayotte</ListItem>
        <ListItem value="MX">Mexico</ListItem>
        <ListItem value="FM">Micronesia, Federated States of</ListItem>
        <ListItem value="MD">Moldova, Republic of</ListItem>
        <ListItem value="MC">Monaco</ListItem>
        <ListItem value="MN">Mongolia</ListItem>
        <ListItem value="ME">Montenegro</ListItem>
        <ListItem value="MS">Montserrat</ListItem>
        <ListItem value="MA">Morocco</ListItem>
        <ListItem value="MZ">Mozambique</ListItem>
        <ListItem value="MM">Myanmar</ListItem>
        <ListItem value="NA">Namibia</ListItem>
        <ListItem value="NR">Nauru</ListItem>
        <ListItem value="NP">Nepal</ListItem>
        <ListItem value="NL">Netherlands</ListItem>
        <ListItem value="NC">New Caledonia</ListItem>
        <ListItem value="NZ">New Zealand</ListItem>
        <ListItem value="NI">Nicaragua</ListItem>
        <ListItem value="NE">Niger</ListItem>
        <ListItem value="NG">Nigeria</ListItem>
        <ListItem value="NU">Niue</ListItem>
        <ListItem value="NF">Norfolk Island</ListItem>
        <ListItem value="MP">Northern Mariana Islands</ListItem>
        <ListItem value="NO">Norway</ListItem>
        <ListItem value="OM">Oman</ListItem>
        <ListItem value="PK">Pakistan</ListItem>
        <ListItem value="PW">Palau</ListItem>
        <ListItem value="PS">Palestinian Territory, Occupied</ListItem>
        <ListItem value="PA">Panama</ListItem>
        <ListItem value="PG">Papua New Guinea</ListItem>
        <ListItem value="PY">Paraguay</ListItem>
        <ListItem value="PE">Peru</ListItem>
        <ListItem value="PH">Philippines</ListItem>
        <ListItem value="PN">Pitcairn</ListItem>
        <ListItem value="PL">Poland</ListItem>
        <ListItem value="PT">Portugal</ListItem>
        <ListItem value="PR">Puerto Rico</ListItem>
        <ListItem value="QA">Qatar</ListItem>
        <ListItem value="RE">Réunion</ListItem>
        <ListItem value="RO">Romania</ListItem>
        <ListItem value="RU">Russian Federation</ListItem>
        <ListItem value="RW">Rwanda</ListItem>
        <ListItem value="BL">Saint Barthélemy</ListItem>
        <ListItem value="SH">Saint Helena, Ascension and Tristan da Cunha</ListItem>
        <ListItem value="KN">Saint Kitts and Nevis</ListItem>
        <ListItem value="LC">Saint Lucia</ListItem>
        <ListItem value="MF">Saint Martin (French part)</ListItem>
        <ListItem value="PM">Saint Pierre and Miquelon</ListItem>
        <ListItem value="VC">Saint Vincent and the Grenadines</ListItem>
        <ListItem value="WS">Samoa</ListItem>
        <ListItem value="SM">San Marino</ListItem>
        <ListItem value="ST">Sao Tome and Principe</ListItem>
        <ListItem value="SA">Saudi Arabia</ListItem>
        <ListItem value="SN">Senegal</ListItem>
        <ListItem value="RS">Serbia</ListItem>
        <ListItem value="SC">Seychelles</ListItem>
        <ListItem value="SL">Sierra Leone</ListItem>
        <ListItem value="SG">Singapore</ListItem>
        <ListItem value="SX">Sint Maarten (Dutch part)</ListItem>
        <ListItem value="SK">Slovakia</ListItem>
        <ListItem value="SI">Slovenia</ListItem>
        <ListItem value="SB">Solomon Islands</ListItem>
        <ListItem value="SO">Somalia</ListItem>
        <ListItem value="ZA">South Africa</ListItem>
        <ListItem value="GS">South Georgia and the South Sandwich Islands</ListItem>
        <ListItem value="SS">South Sudan</ListItem>
        <ListItem value="ES">Spain</ListItem>
        <ListItem value="LK">Sri Lanka</ListItem>
        <ListItem value="SD">Sudan</ListItem>
        <ListItem value="SR">Suriname</ListItem>
        <ListItem value="SJ">Svalbard and Jan Mayen</ListItem>
        <ListItem value="SZ">Swaziland</ListItem>
        <ListItem value="SE">Sweden</ListItem>
        <ListItem value="CH">Switzerland</ListItem>
        <ListItem value="SY">Syrian Arab Republic</ListItem>
        <ListItem value="TW">Taiwan, Province of China</ListItem>
        <ListItem value="TJ">Tajikistan</ListItem>
        <ListItem value="TZ">Tanzania, United Republic of</ListItem>
        <ListItem value="TH">Thailand</ListItem>
        <ListItem value="TL">Timor-Leste</ListItem>
        <ListItem value="TG">Togo</ListItem>
        <ListItem value="TK">Tokelau</ListItem>
        <ListItem value="TO">Tonga</ListItem>
        <ListItem value="TT">Trinidad and Tobago</ListItem>
        <ListItem value="TN">Tunisia</ListItem>
        <ListItem value="TR">Turkey</ListItem>
        <ListItem value="TM">Turkmenistan</ListItem>
        <ListItem value="TC">Turks and Caicos Islands</ListItem>
        <ListItem value="TV">Tuvalu</ListItem>
        <ListItem value="UG">Uganda</ListItem>
        <ListItem value="UA">Ukraine</ListItem>
        <ListItem value="AE">United Arab Emirates</ListItem>
        <ListItem value="GB">United Kingdom</ListItem>
        <ListItem value="US">United States</ListItem>
        <ListItem value="UM">United States Minor Outlying Islands</ListItem>
        <ListItem value="UY">Uruguay</ListItem>
        <ListItem value="UZ">Uzbekistan</ListItem>
        <ListItem value="VU">Vanuatu</ListItem>
        <ListItem value="VE">Venezuela, Bolivarian Republic of</ListItem>
        <ListItem value="VN">Viet Nam</ListItem>
        <ListItem value="VG">Virgin Islands, British</ListItem>
        <ListItem value="VI">Virgin Islands, U.S.</ListItem>
        <ListItem value="WF">Wallis and Futuna</ListItem>
        <ListItem value="EH">Western Sahara</ListItem>
        <ListItem value="YE">Yemen</ListItem>
        <ListItem value="ZM">Zambia</ListItem>
        <ListItem value="ZW">Zimbabwe</ListItem>
      </List>
    )
  );
